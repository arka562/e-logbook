# Backend regression tests

Every fix from the 2026-11 audit programme (PRs #1–#9) originally
shipped with a one-off test script that was deleted after it ran.
This suite makes those checks permanent: if a future change
reintroduces one of those bugs, `npm test` fails.

## Running

```bash
cd elogbook-backend
npm install   # once — includes mongodb-memory-server (dev)
npm test
```

The tests boot the **real server** (`server.js`) as a child process
against a throwaway in-memory MongoDB and talk to it over HTTP —
nothing is mocked. The first run downloads a `mongod` binary
(~100 MB, cached afterwards). Each test file uses its own port and
database, so files run in parallel. No `.env` or running services
are needed.

## What is covered

| File | Locks in |
|---|---|
| `auth.test.mjs` | PR #1 — client-supplied `role` is ignored (always `operator`), email is trimmed/lowercased, duplicates rejected, login works |
| `shifts-entries.test.mjs` | PR #3 + #5 — entries rejected on locked shifts, duplicate shifts rejected (including under concurrency), lifecycle transitions guarded |
| `errors.test.mjs` | PR #7 — malformed ID → 400 JSON (server survives), JSON 404s, 500s never leak internal error text |
| `audit.test.mjs` | PR #8 — issue create/update/delete, event create and entry create all write audit rows; the delete row keeps a snapshot of the deleted issue |
| `ml.test.mjs` | PR #9 — anomaly guards: invalid ID → 400, too-few readings → 400, missing Python binary → clean 502, equipment-risk answers on the new path and the deprecated alias |

## Python tests

The anomaly script has its own contract tests:

```bash
cd elogbook-ml
pip install -r requirements.txt   # once
python -m unittest test_anomaly -v
```

They skip automatically when pandas/scikit-learn are not installed.
The Node suite covers the ML *integration* failure modes (timeout
behaviour is exercised in `ml.test.mjs` only for the spawn-failure
path; the 504 timeout path is covered by the `ML_TIMEOUT_MS`
plumbing in `mlController.js` and was verified in PR #9).
