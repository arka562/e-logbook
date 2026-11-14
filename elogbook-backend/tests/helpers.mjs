// Shared harness for the backend regression suite.
//
// Every test file boots the REAL server (server.js as a child process)
// against a throwaway in-memory MongoDB, then talks to it over HTTP.
// Nothing is mocked: these tests exist to lock in the behaviour that
// PRs #1–#9 fixed, exercising the same paths a client would.
//
// First run downloads a mongod binary (cached afterwards by
// mongodb-memory-server). Each test file uses its own port and its
// own database, so files can run in parallel.
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { MongoMemoryServer } from "mongodb-memory-server";

const BACKEND_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
);

export const ADMIN = { email: "admin@test.com", password: "Admin123" };

export async function startTestServer({ port, env = {} }) {
  const mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri("elogbook-test");

  const proc = spawn(process.execPath, ["server.js"], {
    cwd: BACKEND_DIR,
    env: {
      ...process.env,
      MONGO_URI: mongoUri,
      JWT_SECRET: "test-secret",
      PORT: String(port),
      ...env,
    },
  });

  let serverLog = "";
  proc.stdout.on("data", (d) => (serverLog += d));
  proc.stderr.on("data", (d) => (serverLog += d));

  const base = `http://127.0.0.1:${port}/api`;
  const deadline = Date.now() + 45000;
  for (;;) {
    if (proc.exitCode !== null) {
      throw new Error(`server exited early (code ${proc.exitCode}):\n${serverLog}`);
    }
    try {
      const res = await fetch(`${base}/health`);
      if (res.ok) break;
    } catch {
      /* not up yet */
    }
    if (Date.now() > deadline) {
      throw new Error(`server did not become healthy in 45s:\n${serverLog}`);
    }
    await new Promise((r) => setTimeout(r, 250));
  }

  return {
    base,
    mongoUri,
    async stop() {
      proc.kill("SIGTERM");
      await mongoose.disconnect().catch(() => {});
      await mongo.stop();
    },
  };
}

// Insert an admin user directly (there is deliberately no public
// endpoint that can create one — see PR #1).
export async function seedAdmin(mongoUri) {
  await mongoose.connect(mongoUri);
  const hash = await bcrypt.hash(ADMIN.password, 10);
  await mongoose.connection.db.collection("users").insertOne({
    name: "Test Admin",
    email: ADMIN.email,
    password: hash,
    role: "admin",
    department: "Ops",
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  await mongoose.disconnect();
}

export async function api(base, pathName, { method = "GET", token, body } = {}) {
  const res = await fetch(`${base}${pathName}`, {
    method,
    headers: {
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* non-JSON response — json stays null, tests can assert on that */
  }
  return { status: res.status, json, text };
}

export async function login(base, email = ADMIN.email, password = ADMIN.password) {
  const { json } = await api(base, "/auth/login", {
    method: "POST",
    body: { email, password },
  });
  return json.token;
}

// Build the plant -> department -> unit -> parameter -> shift chain
// through the real API, the same way the frontend would.
export async function seedChain(base, token, { date = "2026-11-14" } = {}) {
  const plantRes = await api(base, "/admin/plant", {
    method: "POST",
    token,
    body: { name: `Plant ${date}-${Math.random()}`, location: "Site 1" },
  });
  const plant = plantRes.json.message._id;

  const deptRes = await api(base, "/admin/department", {
    method: "POST",
    token,
    body: { name: "Ops", plantId: plant },
  });
  const department = deptRes.json._id;

  const unitRes = await api(base, "/admin/unit", {
    method: "POST",
    token,
    body: { name: "Unit 1", departmentId: department, plantId: plant },
  });
  const unit = unitRes.json._id;

  const paramRes = await api(base, "/parameters/templates", {
    method: "POST",
    token,
    body: { name: "Boiler Temp", category: "shift_parameters", unit: "C", plant },
  });
  const parameter = paramRes.json.data._id;

  const shiftRes = await api(base, "/shifts", {
    method: "POST",
    token,
    body: { date, shiftType: "A", plant, unit },
  });
  const shift = shiftRes.json.data._id;

  return { plant, department, unit, parameter, shift };
}
