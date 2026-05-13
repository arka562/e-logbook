import { spawn } from "child_process";
import mongoose from "mongoose";
import ParameterEntry from "../models/ParameterEntry.js";

export const detectAnomaly = async (req, res) => {
  try {
    const { parameterId } = req.query;

    // ✅ Validate parameterId
    if (!parameterId || !mongoose.Types.ObjectId.isValid(parameterId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid parameterId",
      });
    }

    // ✅ Fetch data
    const entries = await ParameterEntry.find({
      parameterId: parameterId,
    }).sort({ createdAt: 1 });

    // ✅ Clean data
    const data = entries
      .map((e) => Number(e.unit1Value))
      .filter((v) => !isNaN(v))
      .map((v) => ({ value: v }));

    if (data.length < 5) {
      return res.status(400).json({
        success: false,
        message: "Not enough data for anomaly detection",
      });
    }

    // ✅ Spawn Python process
    const py = spawn("python", ["ml/anomaly.py"]);

    let result = "";
    let errorOutput = "";

    py.stdin.write(JSON.stringify(data));
    py.stdin.end();

    py.stdout.on("data", (chunk) => {
      result += chunk.toString();
    });

    py.stderr.on("data", (err) => {
      errorOutput += err.toString();
    });

    py.on("close", (code) => {
      if (errorOutput) {
        console.error("Python Error:", errorOutput);
        return res.status(500).json({
          success: false,
          message: errorOutput,
        });
      }

      try {
        const parsed = JSON.parse(result);

        if (parsed.error) {
          return res.status(400).json({
            success: false,
            message: parsed.error,
          });
        }

        return res.status(200).json({
          success: true,
          count: parsed.length,
          data: parsed,
        });

      } catch (err) {
        return res.status(500).json({
          success: false,
          message: "Invalid ML response",
        });
      }
    });

  } catch (err) {
    console.error("ML Controller Error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};