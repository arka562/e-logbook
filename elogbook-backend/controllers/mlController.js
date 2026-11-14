import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import ParameterEntry from "../models/ParameterEntry.mode.js";
import Issue from "../models/Issue.model.js";

// ---------------------------------------------------------------------------
// ML service configuration
//
// The anomaly detector is a Python script (elogbook-ml/anomaly.py) run as a
// child process. How this integration used to fail:
// - The script path was relative ("../elogbook-ml/anomaly.py"), so it only
//   worked when the server happened to be started from elogbook-backend/.
// - The binary was "python", which does not exist on most Linux servers
//   (python3 does) — and a failed spawn emits an "error" event that had NO
//   listener, so the request hung or the process threw.
// - There was no timeout: a hung Python process hung the HTTP request
//   forever.
// - ANY stderr output (including harmless library warnings) was treated as
//   failure, and the raw stderr text was sent to the client.
// - The training query was unbounded, and every request dumped all raw
//   values into the server log.
// Paths are now resolved from this file's location, the binary and timeout
// are configurable, stderr is logged server-side only, and the dataset is
// bounded on both ends (too little data is meaningless; too much is a
// memory/latency risk).
// ---------------------------------------------------------------------------

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ANOMALY_SCRIPT = path.resolve(__dirname, "../../elogbook-ml/anomaly.py");
const PYTHON_BIN = process.env.PYTHON_BIN || "python3";
const ML_TIMEOUT_MS = Number(process.env.ML_TIMEOUT_MS) || 15000;

// Keep in sync with MIN_SAMPLES in elogbook-ml/anomaly.py.
const MIN_SAMPLES = 10;
const MAX_SAMPLES = 5000;

export const detectAnomaly = async (req, res) => {
  try {
    const { parameterId } = req.query;

    if (!parameterId || !mongoose.Types.ObjectId.isValid(parameterId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid parameterId",
      });
    }

    // Most recent MAX_SAMPLES entries, restored to chronological order
    // for training.
    const entries = await ParameterEntry.find({ parameterId })
      .sort({ createdAt: -1 })
      .limit(MAX_SAMPLES);
    entries.reverse();

    const data = entries
      .map((e) => Number(e.unit1Value))
      .filter((v) => !isNaN(v))
      .map((v) => ({ value: v }));

    if (data.length < MIN_SAMPLES) {
      return res.status(400).json({
        success: false,
        message: `Not enough data for anomaly detection (need at least ${MIN_SAMPLES} numeric readings, got ${data.length})`,
      });
    }

    const py = spawn(PYTHON_BIN, [ANOMALY_SCRIPT]);

    let result = "";
    let errorOutput = "";
    let responded = false;

    const respond = (fn) => {
      if (!responded) {
        responded = true;
        fn();
      }
    };

    // A Python process that outlives the timeout is killed; the client
    // gets a 504 instead of a request that hangs forever.
    const timer = setTimeout(() => {
      py.kill("SIGKILL");
      respond(() =>
        res.status(504).json({
          success: false,
          message: "ML service timed out",
        })
      );
    }, ML_TIMEOUT_MS);

    // Spawn failure (binary missing, script missing) arrives here, NOT
    // via "close" — without this listener the process throws.
    py.on("error", (err) => {
      clearTimeout(timer);
      console.error("ML spawn failed:", err.message);
      respond(() =>
        res.status(502).json({
          success: false,
          message: "ML service unavailable",
        })
      );
    });

    py.stdin.write(JSON.stringify(data));
    py.stdin.end();

    py.stdout.on("data", (chunk) => {
      result += chunk.toString();
    });

    py.stderr.on("data", (chunk) => {
      errorOutput += chunk.toString();
    });

    py.on("close", (code) => {
      clearTimeout(timer);

      if (code !== 0) {
        // Contract with anomaly.py: deliberate, client-safe validation
        // failures are printed to stderr as "ERROR: <message>" and the
        // script exits 1. Anything else is an internal failure — log
        // the detail server-side, return a generic 502.
        const authored = errorOutput
          .split("\n")
          .find((line) => line.startsWith("ERROR:"));
        if (authored) {
          return respond(() =>
            res.status(400).json({
              success: false,
              message: authored.replace("ERROR:", "").trim(),
            })
          );
        }
        console.error(`ML process exited with code ${code}:`, errorOutput);
        return respond(() =>
          res.status(502).json({
            success: false,
            message: "ML service failed",
          })
        );
      }

      try {
        const parsed = JSON.parse(result);
        return respond(() =>
          res.status(200).json({
            success: true,
            count: parsed.length,
            data: parsed,
          })
        );
      } catch {
        console.error("ML process returned unparseable output:", result);
        return respond(() =>
          res.status(502).json({
            success: false,
            message: "Invalid ML response",
          })
        );
      }
    });
  } catch (err) {
    console.error("ML Controller Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ---------------------------------------------------------------------------
// Equipment issue-frequency risk.
//
// This is NOT machine learning and NOT predictive maintenance: it counts
// how many issues each equipment has accumulated and buckets the count
// (>=4 High, >=2 Medium, else Low). It was previously exposed as
// "/predictive-maintenance", which promised a capability the code does
// not have. The endpoint and handler now carry the honest name; the old
// path remains as a deprecated alias for older clients.
// ---------------------------------------------------------------------------
export const getEquipmentIssueRisk = async (req, res) => {
  try {
    const stats = await Issue.aggregate([
      {
        $group: {
          _id: "$equipment",
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          count: -1,
        },
      },
    ]);

    const result = stats.map((s) => {
      let risk = "Low";

      if (s.count >= 4) {
        risk = "High";
      } else if (s.count >= 2) {
        risk = "Medium";
      }

      return {
        equipment: s._id,
        issueCount: s.count,
        risk,
      };
    });

    return res.status(200).json({
      success: true,
      count: result.length,
      data: result,
    });
  } catch (error) {
    console.error("Equipment Issue Risk Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
