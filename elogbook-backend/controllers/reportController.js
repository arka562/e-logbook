import Shift from "../models/Shift.model.js";
import ParameterEntry from "../models/ParameterTemplate.model.js";
import EventLog from "../models/EventLog.model.js";
import Issue from "../models/Issue.model.js";
import { generateShiftPDF } from "../utils/pdfGenerator.js";

export const getShiftReport = async (req, res) => {
  try {
    const { shiftId } = req.params;

    const shift = await Shift.findById(shiftId)
      .populate("plant", "name")
      .populate("unit", "name")
      .populate("shiftInCharge", "name role");

    if (!shift) {
      return res.status(404).json({
        message: "Shift not found",
      });
    }

    const parameters = await ParameterEntry.find({ shift: shiftId })
      .populate("parameter");

    const events = await EventLog.find({ shift: shiftId })
      .populate("unit", "name")
      .populate("createdBy", "name");

    const issues = await Issue.find({ shift: shiftId })
      .populate("unit", "name")
      .populate("createdBy", "name")
      .populate("resolvedBy", "name");

    res.json({
      shift,
      parameters,
      events,
      issues,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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
      ParameterEntry.find({ shift: shiftId })
        .populate("parameter")
        .sort({ createdAt: 1 }),

      EventLog.find({ shift: shiftId })
        .sort({ createdAt: 1 }),

      Issue.find({ shift: shiftId })
        .sort({ createdAt: 1 }),
    ]);

    const reportData = {
      shift,
      parameters,
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