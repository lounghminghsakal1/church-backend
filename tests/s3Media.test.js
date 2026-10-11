import test from "node:test";
import assert from "node:assert/strict";
import express from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import Priest from "../src/models/Priest.js";
import User from "../src/models/User.js";
import { createS3MediaUploadHandler } from "../src/controllers/mediaUploadController.js";
import { authenticateMediaUpload, parseS3Media } from "../src/middlewares/mediaUploadMiddleware.js";
import { getMediaOptions } from "../src/utils/mediaUploadUtils.js";
import { getS3ObjectUrl } from "../src/config/s3.js";

const actor = new mongoose.Types.ObjectId();
const config = { bucket: "test-bucket", region: "ap-south-1", publicBaseUrl: "https://media.example.com" };
const pdf = Buffer.from("%PDF-1.7\n1 0 obj\n<<>>\nendobj\n%%EOF");
const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jN2kAAAAASUVORK5CYII=", "base64");
const response = () => ({
  statusCode: 200, status(code) { this.statusCode = code; return this; },
  json(body) { this.body = body; return this; },
});
const request = (overrides = {}) => ({
  body: { media_context: "family_card", media_type: "pdf" }, query: {},
  mediaActors: { user: actor }, file: { buffer: pdf, size: pdf.length, mimetype: "application/pdf" },
  ...overrides,
});

test("context allowlist and body/query validation prevent arbitrary folders and incompatible types", () => {
  assert.equal(getMediaOptions({}, { media_context: "announcement", media_type: "image" }).context.role, "priest");
  assert.equal(getMediaOptions({ media_context: "family_card" }, { media_type: "pdf" }).media_type, "pdf");
  for (const [body, query] of [
    [{}, {}], [{ media_context: "../escape", media_type: "pdf" }, {}],
    [{ media_context: "__proto__", media_type: "image" }, {}],
    [{ media_context: "announcement", media_type: "pdf" }, {}],
    [{ media_context: "family_card", media_type: "image" }, { media_type: "pdf" }],
    [{}, { media_context: ["family_card"], media_type: "pdf" }],
  ]) assert.throws(() => getMediaOptions(body, query));
});

test("private URLs use S3, public URLs optionally use CDN and encode keys", () => {
  assert.equal(getS3ObjectUrl(config, "private/family_cards/a/my file.pdf"),
    "https://s3.ap-south-1.amazonaws.com/test-bucket/private/family_cards/a/my%20file.pdf");
  assert.equal(getS3ObjectUrl(config, "public/announcements/a/x.png"),
    "https://media.example.com/public/announcements/a/x.png");
  assert.throws(() => getS3ObjectUrl({ ...config, publicBaseUrl: "http://example.com" }, "public/x.png"));
});

test("upload sends verified content with a generated owner-scoped key and returns a stable URL", async () => {
  const commands = [];
  const handler = createS3MediaUploadHandler({ configForUpload: () => config,
    clientForUpload: () => ({ send: async command => commands.push(command) }) });
  const res = response();
  await handler(request(), res);
  assert.equal(res.statusCode, 201);
  assert.match(res.body.data.key, new RegExp(`^private/family_cards/${actor}/[a-f0-9-]+\\.pdf$`));
  assert.equal(commands[0].input.Bucket, config.bucket);
  assert.equal(commands[0].input.Body, pdf);
  assert.equal(commands[0].input.ContentType, "application/pdf");
  assert.equal(commands[0].input.ACL, undefined);
  assert.equal(res.body.data.url.includes("?"), false);
});

test("unauthorized contexts, missing files, spoofed MIME and invalid contents never reach S3", async () => {
  let calls = 0;
  const handler = createS3MediaUploadHandler({ configForUpload: () => config,
    clientForUpload: () => ({ send: async () => calls++ }) });
  for (const [req, expected] of [
    [request({ body: { media_context: "announcement", media_type: "image" } }), 403],
    [request({ file: undefined }), 400],
    [request({ file: { buffer: png, size: png.length, mimetype: "application/pdf" } }), 400],
    [request({ file: { buffer: Buffer.from("not a PDF"), size: 9, mimetype: "application/pdf" } }), 400],
  ]) {
    const res = response();
    await handler(req, res);
    assert.equal(res.statusCode, expected);
  }
  assert.equal(calls, 0);
});

test("configuration and AWS errors produce safe responses without leaking credentials", async () => {
  for (const [dependencies, statusCode] of [
    [{ configForUpload: () => { throw new Error("secret config"); } }, 503],
    [{ configForUpload: () => config, clientForUpload: () => ({ send: async () => { throw new Error("secret AWS response"); } }) }, 502],
  ]) {
    const res = response();
    await createS3MediaUploadHandler(dependencies)(request(), res);
    assert.equal(res.statusCode, statusCode);
    assert.equal(JSON.stringify(res.body).includes("secret"), false);
  }
});

test("authentication accepts valid user/priest sessions and handles both cookies independently", async (t) => {
  const secret = "test-upload-secret";
  t.mock.method(jwt, "verify", token => jwt.decode(token));
  for (const Model of [Priest, User]) t.mock.method(Model, "findById", () => ({ select: async () => ({ _id: actor }) }));
  const req = { cookies: {
    token: jwt.sign({ priestId: actor }, secret), userToken: jwt.sign({ userId: actor }, secret),
  } };
  let called = false;
  await authenticateMediaUpload(req, response(), () => { called = true; });
  assert.equal(called, true);
  assert.deepEqual(Object.keys(req.mediaActors).sort(), ["priest", "user"]);
  for (const cookies of [{}, { token: "bad", userToken: "bad" }]) {
    const res = response();
    await authenticateMediaUpload({ cookies }, res, () => assert.fail("Must reject"));
    assert.equal(res.statusCode, 401);
  }
});

test("multipart endpoint handles metadata after file, query params, wrong fields and size limits", async (t) => {
  let sends = 0;
  const app = express();
  app.post("/upload", (req, res, next) => { req.mediaActors = { priest: actor }; next(); }, parseS3Media,
    createS3MediaUploadHandler({ configForUpload: () => config, clientForUpload: () => ({ send: async () => sends++ }) }));
  const server = app.listen(0, "127.0.0.1");
  await new Promise(resolve => server.once("listening", resolve));
  t.after(() => new Promise(resolve => { server.close(resolve); server.closeAllConnections(); }));
  const url = `http://127.0.0.1:${server.address().port}/upload`;
  const form = new FormData();
  form.append("file", new Blob([png], { type: "image/png" }), "untrusted-name.exe");
  form.append("media_context", "announcement");
  form.append("media_type", "image");
  const created = await fetch(url, { method: "POST", body: form });
  const createdBody = await created.json();
  assert.equal(created.status, 201, JSON.stringify(createdBody));
  assert.match(createdBody.data.key, /\.png$/);
  const queryForm = new FormData();
  queryForm.append("file", new Blob([png], { type: "image/png" }), "image.png");
  assert.equal((await fetch(`${url}?media_context=announcement&media_type=image`, { method: "POST", body: queryForm })).status, 201);
  for (const [field, bytes, expected] of [
    ["wrong_field", png, 400], ["file", Buffer.alloc(5 * 1024 * 1024 + 1), 413],
  ]) {
    const invalid = new FormData();
    invalid.append(field, new Blob([bytes], { type: "image/png" }), "image.png");
    assert.equal((await fetch(`${url}?media_context=announcement&media_type=image`, { method: "POST", body: invalid })).status, expected);
  }
  assert.equal(sends, 2);
});
