// Regression tests for PR #7 (error hygiene).
//
// Before the fix, DELETE /api/admin/plants/not-an-id threw an
// unhandled CastError that CRASHED the whole server process, 500
// responses leaked internal error text, and unknown routes got
// Express's HTML 404 page.
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { startTestServer, seedAdmin, api, login } from "./helpers.mjs";

let server;
let base;
let token;

before(async () => {
  server = await startTestServer({ port: 5113 });
  base = server.base;
  await seedAdmin(server.mongoUri);
  token = await login(base);
});

after(() => server.stop());

test("malformed ID returns 400 JSON and the server survives", async () => {
  const { status, json } = await api(base, "/admin/plants/not-an-id", {
    method: "DELETE",
    token,
  });
  assert.equal(status, 400);
  assert.equal(json.success, false);
  assert.equal(json.message, "Invalid ID format");

  const health = await api(base, "/health");
  assert.equal(health.status, 200);
});

test("unknown route returns a JSON 404, not an HTML page", async () => {
  const { status, json } = await api(base, "/does-not-exist");
  assert.equal(status, 404);
  assert.equal(json.success, false);
  assert.match(json.message, /Route not found/);
});

test("a genuine 500 does not leak internal error details", async () => {
  // A numeric email makes the handler throw a TypeError internally
  // (email.trim is not a function). The client must only see the
  // generic message.
  const { status, json, text } = await api(base, "/auth/register", {
    method: "POST",
    body: { name: "X", email: 123, password: "Pass1234", department: "Ops" },
  });
  assert.equal(status, 500);
  assert.equal(json.message, "Server Error");
  assert.doesNotMatch(text, /trim is not a function/);
});
