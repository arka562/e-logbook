// Regression tests for PR #1 (registration security).
//
// The original code accepted `role` from the request body (anyone
// could self-register as admin) and logged the plaintext request
// body, passwords included. These tests pin the fixed behaviour.
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { startTestServer, seedAdmin, api, login, ADMIN } from "./helpers.mjs";

let server;
let base;

before(async () => {
  server = await startTestServer({ port: 5111 });
  base = server.base;
  await seedAdmin(server.mongoUri);
});

after(() => server.stop());

test("register ignores a client-supplied admin role", async () => {
  const { status, json } = await api(base, "/auth/register", {
    method: "POST",
    body: {
      name: "Wannabe Admin",
      email: "wannabe@test.com",
      password: "Pass1234",
      department: "Ops",
      role: "admin", // the attack from the audit
    },
  });
  assert.equal(status, 201);
  assert.equal(json.role, "operator");
});

test("register normalizes email (trim + lowercase) and rejects duplicates", async () => {
  const first = await api(base, "/auth/register", {
    method: "POST",
    body: {
      name: "Case Test",
      email: "  MixedCase@Test.COM ",
      password: "Pass1234",
      department: "Ops",
    },
  });
  assert.equal(first.status, 201);
  assert.equal(first.json.email, "mixedcase@test.com");

  const dup = await api(base, "/auth/register", {
    method: "POST",
    body: {
      name: "Case Test 2",
      email: "mixedcase@test.com",
      password: "Pass1234",
      department: "Ops",
    },
  });
  assert.equal(dup.status, 400);
});

test("login succeeds with correct credentials and fails with wrong ones", async () => {
  const token = await login(base);
  assert.ok(token && token.length > 20);

  const bad = await api(base, "/auth/login", {
    method: "POST",
    body: { email: ADMIN.email, password: "WrongPass1" },
  });
  // The API's existing contract: bad credentials -> 400, no token.
  assert.equal(bad.status, 400);
  assert.ok(!bad.json.token);
});
