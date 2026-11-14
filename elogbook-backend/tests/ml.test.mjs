// Regression tests for PR #9 (ML hardening) — the failure modes
// that do not need a real Python ML environment.
//
// This server is booted with PYTHON_BIN pointing at a binary that
// does not exist: with enough data, the anomaly endpoint must
// answer a clean 502 (previously the unhandled spawn error hung
// the request). With too little data it must answer 400 before
// Python is ever invoked.
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import { startTestServer, seedAdmin, api, login } from "./helpers.mjs";

let server;
let base;
let token;
const bigParam = new mongoose.Types.ObjectId();
const smallParam = new mongoose.Types.ObjectId();

before(async () => {
  server = await startTestServer({
    port: 5115,
    env: { PYTHON_BIN: "/nonexistent-python-binary" },
  });
  base = server.base;
  await seedAdmin(server.mongoUri);
  token = await login(base);

  // Seed parameter readings directly (12 for bigParam, 3 for smallParam).
  await mongoose.connect(server.mongoUri);
  const docs = [];
  for (let i = 0; i < 12; i++) {
    docs.push({
      shiftId: new mongoose.Types.ObjectId(),
      parameterId: bigParam,
      unit1Value: String(100 + i),
      unit2Value: "0",
      createdAt: new Date(Date.now() + i * 1000),
      updatedAt: new Date(),
    });
  }
  for (let i = 0; i < 3; i++) {
    docs.push({
      shiftId: new mongoose.Types.ObjectId(),
      parameterId: smallParam,
      unit1Value: "10",
      unit2Value: "0",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
  await mongoose.connection.db
    .collection("parameterentries")
    .insertMany(docs);
  await mongoose.disconnect();
});

after(() => server.stop());

test("invalid parameterId is rejected with 400", async () => {
  const { status } = await api(base, "/ml/anomaly?parameterId=nope", {
    token,
  });
  assert.equal(status, 400);
});

test("too few readings returns 400 before Python is invoked", async () => {
  const { status, json } = await api(
    base,
    `/ml/anomaly?parameterId=${smallParam}`,
    { token }
  );
  assert.equal(status, 400);
  assert.match(json.message, /Not enough data/);
});

test("missing Python binary returns a clean 502 and the server survives", async () => {
  const { status, json } = await api(
    base,
    `/ml/anomaly?parameterId=${bigParam}`,
    { token }
  );
  assert.equal(status, 502);
  assert.equal(json.message, "ML service unavailable");

  const health = await api(base, "/health");
  assert.equal(health.status, 200);
});

test("equipment-risk endpoint answers on both the new path and the deprecated alias", async () => {
  const fresh = await api(base, "/ml/equipment-risk", { token });
  assert.equal(fresh.status, 200);
  assert.equal(fresh.json.success, true);

  const alias = await api(base, "/ml/predictive-maintenance", { token });
  assert.equal(alias.status, 200);
  assert.equal(alias.json.success, true);
});
