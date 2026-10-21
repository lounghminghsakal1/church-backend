import test from "node:test";
import assert from "node:assert/strict";
import { prepareAvailabilityUpdate } from "../src/utils/availabilityReminderUtils.js";
import { buildAvailabilityEmail } from "../src/services/availabilityEmail.js";
import { dueReminderFilter, processAvailabilityReminders } from "../src/jobs/priestAvailabilityReminders.js";
import mongoose from "mongoose";
import Priest from "../src/models/Priest.js";
import PriestAvailability from "../src/models/PriestAvailability.js";
import { createPriestavailability, editPriestAvailability } from "../src/controllers/priestAvailabilityController.js";

const now = new Date("2030-01-01T10:00:00Z");
const target = new Date("2030-01-01T10:15:00Z");
const config = { minutes: 15, timeZone: "Asia/Kolkata", from: "church@example.com" };
const record = (overrides = {}) => ({
  _id: "availability-1", availability_status: "available", available_until: target,
  priest: { priest_name: "Father John", priest_email: "priest@example.com" },
  ...overrides
});

// In-memory collection with the query operators the worker uses, including atomic claims.
const matches = (doc, query) => Object.entries(query).every(([key, value]) => {
  if (key === "$or") return value.some(item => matches(doc, item));
  if (key === "$and") return value.every(item => matches(doc, item));
  const actual = key.split(".").reduce((obj, part) => obj?.[part], doc);
  if (value === null) return actual == null;
  if (value && typeof value === "object" && !(value instanceof Date)) {
    return Object.entries(value).every(([op, expected]) =>
      op === "$gt" ? actual != null && actual > expected : actual != null && actual <= expected);
  }
  return actual === value;
});
const apply = (doc, update) => {
  for (const [op, fields] of Object.entries(update)) {
    for (const [key, value] of Object.entries(fields)) {
      const parts = key.split(".");
      const leaf = parts.pop();
      const obj = parts.reduce((obj, part) => obj[part] ??= {}, doc);
      obj[leaf] = op === "$inc" ? (obj[leaf] ?? 0) + value : value;
    }
  }
};
const collection = (docs) => ({
  findOneAndUpdate(query, update) {
    const doc = docs.find(doc => matches(doc, query));
    if (doc) apply(doc, update);
    const snapshot = doc ? structuredClone(doc) : null;
    return { select: () => ({ populate: async () => snapshot }) };
  },
  async exists(query) { return docs.some(doc => matches(doc, query)); },
  async updateOne(query, update) {
    const doc = docs.find(doc => matches(doc, query));
    if (doc) apply(doc, update);
  }
});
const run = (model, send, extra = {}) => processAvailabilityReminders({
  model, send, config, clock: () => now, logger: { error() {} }, ...extra
});

test("schedule edits reset reminders; notes and identical times preserve sent state", () => {
  const previous = record();
  assert.equal(prepareAvailabilityUpdate(previous, { notes: "Meeting" }, now).reminder, undefined);
  assert.equal(prepareAvailabilityUpdate(previous, { available_until: target.toISOString() }, now).reminder, undefined);
  const updated = prepareAvailabilityUpdate(previous, {
    availability_status: "not_available", next_available: "2030-01-01T12:00:00Z"
  }, now);
  assert.deepEqual(updated.reminder, {});
  assert.equal(updated.available_until, null);
  const cleared = prepareAvailabilityUpdate(previous, { availability_status: "not_set" }, now);
  assert.equal(cleared.next_available, null);
  assert.equal(cleared.available_until, null);
  assert.deepEqual(cleared.reminder, {});
});

test("missing, invalid and past target dates are rejected", () => {
  for (const available_until of [null, "", "bad date", "2029-01-01T10:00:00Z"]) {
    assert.throws(() => prepareAvailabilityUpdate({}, { availability_status: "available", available_until }, now));
  }
  assert.throws(() => prepareAvailabilityUpdate(record(), { availability_status: "not_available" }, now));
});

test("both statuses are reminded once, including legacy records without reminder fields", async () => {
  const docs = [record(), record({ _id: "availability-2", availability_status: "not_available", next_available: target })];
  const model = collection(docs);
  const sent = [];
  await run(model, async doc => sent.push(doc._id));
  await run(model, async doc => sent.push(doc._id));
  assert.deepEqual(sent, ["availability-1", "availability-2"]);
  assert.ok(docs.every(doc => +doc.reminder.sent_at === +now));
});

test("future, expired, unset and sent records are skipped", async () => {
  const docs = [record({ available_until: new Date(+target + 1) }),
    record({ available_until: now }), record({ availability_status: "not_set" }),
    record({ reminder: { sent_at: now } })];
  await run(collection(docs), async () => assert.fail("must not send"));
  assert.equal(matches(record(), dueReminderFilter(now, 15)), true);
});

test("failed deliveries wait for retry, then succeed", async () => {
  const doc = record();
  const model = collection([doc]);
  let attempts = 0;
  await run(model, async () => { attempts++; throw new Error("SES unavailable"); });
  assert.equal(doc.reminder.sent_at, undefined);
  assert.equal(+doc.reminder.retry_at, +now + 60_000);
  await run(model, async () => attempts++);
  assert.equal(attempts, 1);
  await run(model, async () => attempts++, { clock: () => new Date(+now + 60_000) });
  assert.equal(attempts, 2);
  assert.ok(doc.reminder.sent_at);
});

test("concurrent workers do not send the same claimed reminder", async () => {
  const model = collection([record()]);
  let sent = 0;
  await Promise.all([run(model, async () => sent++), run(model, async () => sent++)]);
  assert.equal(sent, 1);
});

test("active leases are skipped and abandoned leases recover", async () => {
  const doc = record({ reminder: { token: "abandoned", lease_until: new Date(+now + 60_000) } });
  const model = collection([doc]);
  let sent = 0;
  await run(model, async () => sent++);
  assert.equal(sent, 0);
  await run(model, async () => sent++, { clock: () => new Date(+now + 60_000) });
  assert.equal(sent, 1);
});

test("edits invalidate claimed work and old sends cannot mark a new schedule as sent", async () => {
  const doc = record();
  const model = collection([doc]);
  model.exists = async () => { doc.reminder = {}; return false; };
  await run(model, async () => assert.fail("stale schedule"), { batchSize: 1 });
  model.exists = async query => matches(doc, query);
  await run(model, async () => {
    doc.available_until = new Date(+target + 60_000);
    doc.reminder = {};
  });
  assert.equal(doc.reminder.sent_at, undefined);
});

test("email uses the correct recipient, status and explicit local timezone", () => {
  const email = buildAvailabilityEmail(record(), config);
  assert.deepEqual(email.Destination.ToAddresses, ["priest@example.com"]);
  assert.match(email.Message.Body.Text.Data, /availability ends/);
  assert.match(email.Message.Body.Text.Data, /Asia\/Kolkata/);
  assert.match(buildAvailabilityEmail(record({ availability_status: "not_available", next_available: target }), config)
    .Message.Body.Text.Data, /availability begins/);
  assert.throws(() => buildAvailabilityEmail(record({ priest: null }), config));
});

const response = () => ({
  statusCode: 200, status(code) { this.statusCode = code; return this; },
  json(body) { this.body = body; return this; }
});

test("creation accepts the authenticated ObjectId and initializes the reminder", async t => {
  const priest = new mongoose.Types.ObjectId();
  t.mock.method(Priest, "findOne", async () => ({ _id: priest }));
  t.mock.method(PriestAvailability, "findOne", async () => null);
  let saved;
  t.mock.method(PriestAvailability, "create", async data => { saved = data; return data; });
  const res = response();
  await createPriestavailability({ priest: { _id: priest }, body: {
    priest: String(priest), availability_status: "available", available_until: "2099-01-01T10:00:00Z"
  } }, res);
  assert.equal(res.statusCode, 201);
  assert.deepEqual(saved.reminder, {});
});

test("date-only edits reset reminders and include owner/version in the atomic update", async t => {
  const priest = new mongoose.Types.ObjectId();
  const existing = new PriestAvailability({ priest, availability_status: "available", available_until: target, __v: 2 });
  t.mock.method(PriestAvailability, "findOne", async () => existing);
  let mutation;
  t.mock.method(PriestAvailability, "findOneAndUpdate", async (query, update) => {
    mutation = { query, update }; return existing;
  });
  const res = response();
  await editPriestAvailability({ priest: { _id: priest }, params: { priest_availability_id: String(existing._id) },
    body: { available_until: "2099-01-01T10:00:00Z" } }, res);
  assert.equal(res.statusCode, 200);
  assert.deepEqual(mutation.update.$set.reminder, {});
  assert.equal(String(mutation.query.priest), String(priest));
  assert.equal(mutation.query.__v, 2);
  assert.equal(mutation.update.$inc.__v, 1);
});

test("another priest cannot edit availability or its reminder", async t => {
  const existing = new PriestAvailability({ priest: new mongoose.Types.ObjectId(), availability_status: "not_set" });
  t.mock.method(PriestAvailability, "findOne", async () => existing);
  t.mock.method(PriestAvailability, "findOneAndUpdate", async () => assert.fail("unauthorized mutation"));
  const res = response();
  await editPriestAvailability({ priest: { _id: new mongoose.Types.ObjectId() },
    params: { priest_availability_id: String(existing._id) }, body: { notes: "Changed" } }, res);
  assert.equal(res.statusCode, 403);
});

test("conflicting schedule edits return 409 instead of overwriting the newer schedule", async t => {
  const priest = new mongoose.Types.ObjectId();
  const existing = new PriestAvailability({ priest, availability_status: "not_set", __v: 0 });
  t.mock.method(PriestAvailability, "findOne", async () => existing);
  t.mock.method(PriestAvailability, "findOneAndUpdate", async () => null);
  const res = response();
  await editPriestAvailability({ priest: { _id: priest }, params: { priest_availability_id: String(existing._id) },
    body: { notes: "Changed" } }, res);
  assert.equal(res.statusCode, 409);
});
