import Shift from "../models/Shift.model.js";
import ParameterEntry from "../models/ParameterEntry.mode.js";
import EventLog from "../models/EventLog.model.js";
import Issue from "../models/Issue.model.js";
import { generateShiftPDF } from "../utils/pdfGenerator.js";

const normalizeParameterEntries = (entries) =>
  entries.map((entry) => {
    const entryObject = entry.toObject();
    return {
      ...entryObject,
      parameter: entryObject.parameterId,
    };
  });

/* ================= GET SHIFT REPORT ================= */
export const getShiftReport = async (req, res) => {
  try {
    const { shiftId } = req.params;

    const shift = await Shift.findById(shiftId)
      .populate("plant", "name")
      .populate("unit", "name")
      .populate("shiftInCharge", "name role");

    if (!shift) {
      return res.status(404).json({
        success: false,
        message: "Shift not found",
      });
    }

    const parameters = await ParameterEntry.find({ shiftId })
      .populate("parameterId");

    const events = await EventLog.find({ shift: shiftId })
      .populate("unit", "name")
      .populate("createdBy", "name");

    const issues = await Issue.find({ shift: shiftId })
      .populate("unit", "name")
      .populate("createdBy", "name")
      .populate("resolvedBy", "name");

    // ✅ FIXED RESPONSE STRUCTURE
    res.status(200).json({
      success: true,
      data: {
        shift,
        parameters: normalizeParameterEntries(parameters),
        events,
        issues,
      },
    });

  } catch (error) {
    console.error("GET SHIFT REPORT ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/* ================= DOWNLOAD PDF ================= */
export const downloadShiftReport = async (req, res) => {
  try {
    const { shiftId } = req.params;

    const shift = await Shift.findById(shiftId)
      .populate("plant", "name")
      .populate("unit", "name")
      .populate("shiftInCharge", "name");

    if (!shift) {
      return res.status(404).json({
        success: false,
        message: "Shift not found",
      });
    }

    const [parameters, events, issues] = await Promise.all([
      ParameterEntry.find({ shiftId })
        .populate("parameterId")
        .sort({ createdAt: 1 }),

      EventLog.find({ shift: shiftId })
        .sort({ createdAt: 1 }),

      Issue.find({ shift: shiftId })
        .sort({ createdAt: 1 }),
    ]);

    const reportData = {
      shift,
      parameters: normalizeParameterEntries(parameters),
      events,
      issues,
    };

    generateShiftPDF(res, reportData);

  } catch (error) {
    console.error("REPORT GENERATION ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to generate report",
    });
  }
};
