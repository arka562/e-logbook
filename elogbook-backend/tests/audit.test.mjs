// Regression tests for PR #8 (audit coverage).
//
// Before the fix, only shift lifecycle transitions were audited.
// Issues could be created and hard-deleted with no trace; events
// and parameter entries were likewise invisible in the audit log.
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
let token;
let chain;
let issueId;

before(async () => {
  server = await startTestServer({ port: 5114 });
  base = server.base;
  await seedAdmin(server.mongoUri);
  token = await login(base);
  chain = await seedChain(base, token, { date: "2026-11-16" });
});

after(() => server.stop());

async function auditRows() {
  const { json } = await api(base, "/audit?limit=100", { token });
  return json.data || json.logs || [];
}

test("issue create, event create and entry create are all audited", async () => {
  const issue = await api(base, "/issues", {
    method: "POST",
    token,
    body: {
      shiftId: chain.shift,
      unitId: chain.unit,
      equipment: "Boiler Feed Pump",
      description: "Vibration high",
      department: chain.department,
      priority: "high",
    },
  });
  assert.equal(issue.status, 201);
  issueId = issue.json.data._id;

  const event = await api(base, "/events", {
    method: "POST",
    token,
    body: {
      shiftId: chain.shift,
      unitId: chain.unit,
      description: "Unit synchronized",
    },
  });
  assert.equal(event.status, 201);

  const entry = await api(base, "/entries", {
    method: "POST",
    token,
    body: {
      shiftId: chain.shift,
      parameterId: chain.parameter,
      unit1Value: "540",
      unit2Value: "545",
    },
  });
  assert.equal(entry.status, 201);

  const rows = await auditRows();
  const keys = rows.map((r) => `${r.module}/${r.action}`);
  assert.ok(keys.includes("ISSUE/CREATE"), `missing ISSUE/CREATE in ${keys}`);
  assert.ok(keys.includes("EVENT/CREATE"), `missing EVENT/CREATE in ${keys}`);
  assert.ok(
    keys.includes("PARAMETER/CREATE"),
    `missing PARAMETER/CREATE in ${keys}`
  );
});

test("issue status change and hard delete are audited", async () => {
  const upd = await api(base, `/issues/${issueId}/status`, {
    method: "PATCH",
    token,
    body: { status: "wip" },
  });
  assert.equal(upd.status, 200);

  const del = await api(base, `/issues/${issueId}`, {
    method: "DELETE",
    token,
  });
  assert.equal(del.status, 200);

  const rows = await auditRows();
  const update = rows.find(
    (r) => r.module === "ISSUE" && r.action === "UPDATE"
  );
  assert.ok(update, "missing ISSUE/UPDATE row");
  assert.equal(update.oldData.status, "open");
  assert.equal(update.newData.status, "wip");

  const delRow = rows.find(
    (r) => r.module === "ISSUE" && r.action === "DELETE"
  );
  assert.ok(delRow, "missing ISSUE/DELETE row");
  // The hard-deleted issue's snapshot must survive in the audit row.
  assert.equal(delRow.oldData.equipment, "Boiler Feed Pump");
});
