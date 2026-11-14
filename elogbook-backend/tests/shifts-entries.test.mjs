// Regression tests for PR #3 (locked-shift entries) and
// PR #5 (shift uniqueness + atomic lifecycle transitions).
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import {
  startTestServer,
  seedAdmin,
  api,
  login,
  seedChain,
} from "./helpers.mjs";

let server;
let base;
let adminToken;
let operatorToken;
let chain;

before(async () => {
  server = await startTestServer({ port: 5112 });
  base = server.base;
  await seedAdmin(server.mongoUri);
  adminToken = await login(base);

  // An operator account (register always creates operators — PR #1).
  await api(base, "/auth/register", {
    method: "POST",
    body: {
      name: "Operator One",
      email: "operator@test.com",
      password: "Pass1234",
      department: "Ops",
    },
  });
  operatorToken = await login(base, "operator@test.com", "Pass1234");

  chain = await seedChain(base, adminToken);
});

after(() => server.stop());

test("duplicate shift (same date, unit, shift type) is rejected", async () => {
  const body = {
    date: "2026-11-14",
    shiftType: "A",
    plant: chain.plant,
    unit: chain.unit,
  };
  const { status, json } = await api(base, "/shifts", {
    method: "POST",
    token: adminToken,
    body,
  });
  assert.equal(status, 400);
  assert.match(json.message, /already exists/i);
});

test("concurrent duplicate creates produce exactly one shift", async () => {
  const body = {
    date: "2026-11-15",
    shiftType: "B",
    plant: chain.plant,
    unit: chain.unit,
  };
  const [a, b] = await Promise.all([
    api(base, "/shifts", { method: "POST", token: adminToken, body }),
    api(base, "/shifts", { method: "POST", token: adminToken, body }),
  ]);
  const statuses = [a.status, b.status].sort();
  assert.deepEqual(statuses, [201, 400]);
});

test("entry can be added to a draft shift", async () => {
  const { status } = await api(base, "/entries", {
    method: "POST",
    token: adminToken,
    body: {
      shiftId: chain.shift,
      parameterId: chain.parameter,
      unit1Value: "100",
      unit2Value: "101",
    },
  });
  assert.equal(status, 201);
});

test("entry is rejected once the shift is locked", async () => {
  // Full lifecycle: operator submits, admin approves, admin locks.
  const submit = await api(base, `/shifts/submit/${chain.shift}`, {
    method: "PUT",
    token: operatorToken,
  });
  assert.equal(submit.status, 200);

  const approve = await api(base, `/shifts/approve/${chain.shift}`, {
    method: "PUT",
    token: adminToken,
  });
  assert.equal(approve.status, 200);

  const lock = await api(base, `/shifts/lock/${chain.shift}`, {
    method: "PUT",
    token: adminToken,
  });
  assert.equal(lock.status, 200);

  const { status, json } = await api(base, "/entries", {
    method: "POST",
    token: adminToken,
    body: {
      shiftId: chain.shift,
      parameterId: chain.parameter,
      unit1Value: "100",
      unit2Value: "101",
    },
  });
  assert.equal(status, 400);
  assert.match(json.message, /locked/i);
});

test("lifecycle transitions are guarded: a locked shift cannot be re-submitted", async () => {
  const { status } = await api(base, `/shifts/submit/${chain.shift}`, {
    method: "PUT",
    token: operatorToken,
  });
  assert.equal(status, 400);
});
