import test from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import express from "express";
import cookieParser from "cookie-parser";
import { priestAnnouncementRouter, userAnnouncementRouter } from "../src/routes/announcementRoutes.js";
import Announcement from "../src/models/Announcement.js";
import { validateAnnouncementPayload, visibleAnnouncementFilter } from "../src/utils/announcementUtils.js";
import {
  createAnnouncement, updateAnnouncement, deleteAnnouncement, getVisibleAnnouncements,
  getVisibleAnnouncement, getPriestAnnouncements, getPriestAnnouncement,
} from "../src/controllers/announcementController.js";
import { authUserMiddleWare, authPriestMiddleware } from "../src/middlewares/authMiddlewares.js";

const priestId = new mongoose.Types.ObjectId();
const announcementId = new mongoose.Types.ObjectId();
const body = () => ({
  title: " Parish feast ", description: "Join us for Mass",
  start_date: "2030-06-01T09:00:00+05:30", end_date: "2030-06-02T18:00:00+05:30",
});
const request = (payload = {}) => ({
  priest: { _id: priestId }, params: { announcement_id: announcementId.toString() }, body: payload,
});
const response = () => ({
  statusCode: 200,
  status(value) { this.statusCode = value; return this; },
  json(value) { this.body = value; return this; },
});

test("validates required fields, optional URLs, status, and date ranges", () => {
  const valid = validateAnnouncementPayload(body());
  assert.equal(valid.title, "Parish feast");
  assert.equal(valid.start_date.toISOString(), "2030-06-01T03:30:00.000Z");
  assert.equal(validateAnnouncementPayload({ ...body(), image_url: "https://example.com/image.jpg", link: "" }).link, "");
  for (const invalid of [undefined, [], {}, { ...body(), title: " " },
    { ...body(), description: 7 }, { ...body(), created_by: priestId },
    { ...body(), image_url: "javascript:alert(1)" }, { ...body(), link: null },
    { ...body(), status: "deleted" }, { ...body(), status: null },
    { ...body(), start_date: "2030-06-01" }, { ...body(), end_date: "2030-02-30T00:00:00Z" },
    { ...body(), end_date: "2029-01-01T00:00:00Z" }]) {
    assert.throws(() => validateAnnouncementPayload(invalid));
  }
});

test("partial edits validate against existing dates and allow deactivation and URL clearing", () => {
  const existing = validateAnnouncementPayload(body());
  assert.deepEqual(validateAnnouncementPayload({ status: "inactive", image_url: "" }, existing), {
    status: "inactive", image_url: "",
  });
  assert.throws(() => validateAnnouncementPayload({ start_date: "2031-01-01T00:00:00Z" }, existing));
  assert.throws(() => validateAnnouncementPayload({ end_date: "2029-01-01T00:00:00Z" }, existing));
});

test("model defaults to active and rejects reversed dates", async () => {
  const announcement = new Announcement({ ...validateAnnouncementPayload(body()), created_by: priestId });
  await announcement.validate();
  assert.equal(announcement.status, "active");
  assert.equal(announcement.image_url, "");
  announcement.end_date = new Date("2029-01-01T00:00:00Z");
  await assert.rejects(announcement.validate(), /end_date/);
});

test("visibility is inclusive at both boundaries and excludes inactive, upcoming, and expired records", () => {
  const now = new Date("2030-01-01T00:00:00Z");
  const filter = visibleAnnouncementFilter(now);
  const visible = (status, start, end) => status === filter.status &&
    start <= filter.start_date.$lte && end >= filter.end_date.$gte;
  assert.equal(visible("active", now, now), true);
  assert.equal(visible("inactive", now, now), false);
  assert.equal(visible("active", new Date(+now + 1), new Date(+now + 2)), false);
  assert.equal(visible("active", new Date(+now - 2), new Date(+now - 1)), false);
});

test("creation derives author from priest session and returns 201", async (t) => {
  t.mock.method(Announcement, "create", async payload => {
    assert.equal(payload.created_by, priestId);
    assert.equal(payload.title, "Parish feast");
    return payload;
  });
  const res = response();
  await createAnnouncement(request(body()), res);
  assert.equal(res.statusCode, 201);
  const invalid = response();
  await createAnnouncement(request({ ...body(), created_by: priestId }), invalid);
  assert.equal(invalid.statusCode, 400);
});

test("priest listing and detail lookup are author-scoped", async (t) => {
  t.mock.method(Announcement, "find", filter => {
    assert.deepEqual(filter, { created_by: priestId });
    return { sort: async () => [] };
  });
  t.mock.method(Announcement, "findOne", async filter => {
    assert.equal(filter.created_by, priestId);
    return null;
  });
  const list = response();
  await getPriestAnnouncements(request(), list);
  assert.deepEqual(list.body.data, []);
  const detail = response();
  await getPriestAnnouncement(request(), detail);
  assert.equal(detail.statusCode, 404);
});

test("updates and deletion cannot access another priest's record", async (t) => {
  for (const method of ["findOne", "findOneAndDelete"]) {
    t.mock.method(Announcement, method, async filter => {
      assert.deepEqual(filter, { _id: announcementId.toString(), created_by: priestId });
      return null;
    });
  }
  for (const handler of [updateAnnouncement, deleteAnnouncement]) {
    const res = response();
    await handler(request({ status: "inactive" }), res);
    assert.equal(res.statusCode, 404);
  }
});

test("priest can deactivate, reactivate, edit, and delete their announcement", async (t) => {
  const document = new Announcement({ ...validateAnnouncementPayload(body()), created_by: priestId });
  document.save = async () => document;
  t.mock.method(Announcement, "findOne", async () => document);
  for (const status of ["inactive", "active"]) {
    const res = response();
    await updateAnnouncement(request({ status, title: "Updated feast" }), res);
    assert.equal(res.statusCode, 200);
    assert.equal(document.status, status);
    assert.equal(document.title, "Updated feast");
  }
  const invalid = response();
  await updateAnnouncement(request({ end_date: "2020-01-01T00:00:00Z" }), invalid);
  assert.equal(invalid.statusCode, 400);
  t.mock.method(Announcement, "findOneAndDelete", async () => document);
  const deleted = response();
  await deleteAnnouncement(request(), deleted);
  assert.equal(deleted.body.status, "success");
});

test("user list and detail both query only active announcements in the current window", async (t) => {
  const check = filter => {
    assert.equal(filter.status, "active");
    assert.ok(filter.start_date.$lte instanceof Date);
    assert.equal(filter.start_date.$lte, filter.end_date.$gte);
    assert.ok(Math.abs(Date.now() - +filter.start_date.$lte) < 1000);
  };
  t.mock.method(Announcement, "find", filter => {
    check(filter);
    return { sort: async () => [] };
  });
  t.mock.method(Announcement, "findOne", async filter => {
    check(filter);
    assert.equal(filter._id, announcementId.toString());
    return null;
  });
  const list = response();
  await getVisibleAnnouncements(request(), list);
  assert.deepEqual(list.body.data, []);
  const detail = response();
  await getVisibleAnnouncement(request(), detail);
  assert.equal(detail.statusCode, 404);
});

test("invalid IDs return 400 without a database lookup", async () => {
  for (const handler of [getPriestAnnouncement, updateAnnouncement, deleteAnnouncement, getVisibleAnnouncement]) {
    const res = response();
    await handler({ ...request(), params: { announcement_id: "bad-id" } }, res);
    assert.equal(res.statusCode, 400);
  }
});

test("role-specific authentication rejects missing and wrong-role cookies without hanging", async () => {
  for (const [middleware, cookies] of [
    [authUserMiddleWare, {}], [authPriestMiddleware, {}],
    [authUserMiddleWare, { token: "priest-cookie" }],
    [authPriestMiddleware, { userToken: "user-cookie" }],
    [authUserMiddleWare, { userToken: "invalid-token" }],
  ]) {
    const res = response();
    await middleware({ cookies }, res, () => assert.fail("Must not authorize request"));
    assert.ok(res.statusCode >= 400);
    assert.equal(res.body.status, "failure");
  }
});

test("announcement reads are public while every priest operation still requires login", async (t) => {
  const visible = { _id: announcementId.toString(), title: "Public announcement" };
  const checkVisibility = filter => {
    assert.equal(filter.status, "active");
    assert.ok(filter.start_date.$lte instanceof Date);
    assert.equal(filter.start_date.$lte, filter.end_date.$gte);
  };
  t.mock.method(Announcement, "find", filter => {
    checkVisibility(filter);
    return { sort: async () => [visible] };
  });
  t.mock.method(Announcement, "findOne", async filter => {
    checkVisibility(filter);
    return filter._id === announcementId.toString() ? visible : null;
  });
  const app = express();
  app.use(cookieParser());
  app.use(express.json());
  app.use("/api/user/announcements", userAnnouncementRouter);
  app.use("/api/priest/announcements", priestAnnouncementRouter);
  const server = app.listen(0, "127.0.0.1");
  await new Promise(resolve => server.once("listening", resolve));
  t.after(() => new Promise(resolve => { server.close(resolve); server.closeAllConnections(); }));
  const origin = `http://127.0.0.1:${server.address().port}`;
  for (const headers of [{}, { Cookie: "userToken=expired; token=invalid" }]) {
    const list = await fetch(`${origin}/api/user/announcements`, { headers });
    assert.equal(list.status, 200);
    assert.deepEqual((await list.json()).data, [visible]);
    const detail = await fetch(`${origin}/api/user/announcements/${announcementId}`, { headers });
    assert.equal(detail.status, 200);
    assert.deepEqual((await detail.json()).data, visible);
  }
  const missing = await fetch(`${origin}/api/user/announcements/${new mongoose.Types.ObjectId()}`);
  assert.equal(missing.status, 404);
  for (const [method, suffix] of [["GET", ""], ["POST", ""], ["GET", `/${announcementId}`],
    ["PATCH", `/${announcementId}`], ["DELETE", `/${announcementId}`]]) {
    const res = await fetch(`${origin}/api/priest/announcements${suffix}`, { method });
    assert.equal(res.status, 401);
  }
});
