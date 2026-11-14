"""Isolation Forest anomaly detection for one parameter's readings.

Contract with the Node backend (elogbook-backend/controllers/mlController.js):
  stdin  : JSON array of {"value": <number>} objects, chronological order.
  stdout : on success ONLY — a JSON array of {"value": ..., "anomaly": 1|-1}
           records (1 = normal, -1 = anomaly). Exit code 0.
  stderr : deliberate, client-safe validation failures are printed as a
           single line "ERROR: <message>" and the script exits 1.
           Anything unexpected raises — Node logs the traceback server-side
           and answers the client with a generic 502.
  config : ML_CONTAMINATION env var (default 0.05) — the expected share of
           anomalies in the data. It was hard-coded to 0.2, which forced the
           model to flag ~20% of ALL readings as anomalies even when the
           plant was running perfectly normally.

The model is retrained on each request from the supplied window of data
(the backend bounds it to the most recent readings). random_state is
pinned so the same input always produces the same output.

Requires at least MIN_SAMPLES numeric readings — with fewer points an
Isolation Forest has nothing meaningful to isolate.
"""

import json
import os
import sys

import pandas as pd
from sklearn.ensemble import IsolationForest

# Keep in sync with MIN_SAMPLES in the backend's mlController.js.
MIN_SAMPLES = 10


def fail(message: str) -> None:
    """Client-safe validation failure: stderr line + exit 1 (see contract)."""
    print(f"ERROR: {message}", file=sys.stderr)
    sys.exit(1)


def get_contamination() -> float:
    raw = os.environ.get("ML_CONTAMINATION", "0.05")
    try:
        value = float(raw)
    except ValueError:
        fail(f"ML_CONTAMINATION must be a number, got '{raw}'")
    if not 0 < value <= 0.5:
        fail(f"ML_CONTAMINATION must be in (0, 0.5], got {value}")
    return value


def main() -> None:
    input_data = sys.stdin.read()
    if not input_data:
        fail("No input data received")

    try:
        data = json.loads(input_data)
    except json.JSONDecodeError:
        fail("Input was not valid JSON")

    df = pd.DataFrame(data)
    if "value" not in df.columns:
        fail("Input data has no 'value' field")

    df["value"] = pd.to_numeric(df["value"], errors="coerce")
    df = df.dropna()

    if len(df) < MIN_SAMPLES:
        fail(
            f"Not enough data for anomaly detection "
            f"(need at least {MIN_SAMPLES} numeric readings, got {len(df)})"
        )

    values = df["value"].values.reshape(-1, 1)

    model = IsolationForest(contamination=get_contamination(), random_state=42)
    model.fit(values)

    df["anomaly"] = model.predict(values)

    print(json.dumps(df.to_dict(orient="records")))


if __name__ == "__main__":
    main()
