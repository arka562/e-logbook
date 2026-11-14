"""Subprocess tests for anomaly.py — the contract the Node backend
(mlController.js) depends on:

  - enough data  -> exit 0, JSON array on stdout, anomalies flagged -1
  - too few data -> exit 1, "ERROR: ..." on stderr, nothing on stdout
  - bad config   -> exit 1, "ERROR: ..." on stderr

Run with the interpreter that has elogbook-ml/requirements.txt
installed:
    python -m unittest test_anomaly -v
Skips itself when pandas/scikit-learn are not installed.
"""

import json
import os
import subprocess
import sys
import unittest

HERE = os.path.dirname(os.path.abspath(__file__))
SCRIPT = os.path.join(HERE, "anomaly.py")

try:
    import pandas  # noqa: F401
    import sklearn  # noqa: F401

    HAVE_DEPS = True
except ImportError:
    HAVE_DEPS = False


def run_anomaly(payload, env_extra=None):
    env = dict(os.environ)
    if env_extra:
        env.update(env_extra)
    return subprocess.run(
        [sys.executable, SCRIPT],
        input=json.dumps(payload),
        capture_output=True,
        text=True,
        env=env,
        timeout=120,
    )


@unittest.skipUnless(HAVE_DEPS, "pandas/scikit-learn not installed")
class TestAnomalyContract(unittest.TestCase):
    def test_extreme_value_is_flagged(self):
        data = [{"value": 100 + (i % 3)} for i in range(30)]
        data.append({"value": 500})
        proc = run_anomaly(data)
        self.assertEqual(proc.returncode, 0, proc.stderr)
        result = json.loads(proc.stdout)
        self.assertEqual(len(result), 31)
        flagged = [r for r in result if r["anomaly"] == -1]
        self.assertTrue(any(r["value"] == 500 for r in flagged))

    def test_too_few_readings_is_an_authored_error(self):
        proc = run_anomaly([{"value": i} for i in range(5)])
        self.assertEqual(proc.returncode, 1)
        self.assertEqual(proc.stdout, "")
        self.assertTrue(proc.stderr.startswith("ERROR:"))
        self.assertIn("Not enough data", proc.stderr)

    def test_invalid_contamination_is_an_authored_error(self):
        data = [{"value": 100 + (i % 3)} for i in range(15)]
        proc = run_anomaly(data, env_extra={"ML_CONTAMINATION": "abc"})
        self.assertEqual(proc.returncode, 1)
        self.assertTrue(proc.stderr.startswith("ERROR:"))


if __name__ == "__main__":
    unittest.main()
