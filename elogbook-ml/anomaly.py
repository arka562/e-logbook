import sys
import json
import pandas as pd
from sklearn.ensemble import IsolationForest

try:
    # Read input from Node
    input_data = sys.stdin.read()

    if not input_data:
        print(json.dumps({"error": "No input data received"}))
        sys.exit(1)

    data = json.loads(input_data)

    if len(data) < 1:
        print(json.dumps({"error": "Not enough data for anomaly detection"}))
        sys.exit(1)

    # Convert to DataFrame
    df = pd.DataFrame(data)

    # Ensure numeric values
    df["value"] = pd.to_numeric(df["value"], errors="coerce")

    # Drop invalid values
    df = df.dropna()

    if df.empty:
        print(json.dumps({"error": "No valid numeric data"}))
        sys.exit(1)

    values = df["value"].values.reshape(-1, 1)

    # Train model
    model = IsolationForest(contamination=0.2, random_state=42)
    model.fit(values)

    # Predict
    df["anomaly"] = model.predict(values)

    # Convert output
    result = df.to_dict(orient="records")

    print(json.dumps(result))

except Exception as e:
    print(json.dumps({"error": str(e)}))
    sys.exit(1)