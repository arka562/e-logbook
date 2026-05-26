import Shift from "../models/Shift.model.js";
import ParameterEntry from "../models/ParameterEntry.mode.js";
import EventLog from "../models/EventLog.model.js";
import Issue from "../models/Issue.model.js";
import ParameterTemplate from "../models/ParameterTemplate.model.js";
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

/* ================= DATE RANGE REPORT ================= */
export const getDateRangeReport = async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      plant,
      unit,
      issueStatus,
      parameterCategory,
    } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Start date and end date are required",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date range",
      });
    }

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    if (start > end) {
      return res.status(400).json({
        success: false,
        message: "Start date cannot be after end date",
      });
    }

    const shiftFilter = {
      date: {
        $gte: start,
        $lte: end,
      },
    };

    if (plant) shiftFilter.plant = plant;
    if (unit) shiftFilter.unit = unit;

    const shifts = await Shift.find(shiftFilter)
      .populate("plant", "name")
      .populate("unit", "name")
      .populate("shiftInCharge", "name role")
      .sort({ date: -1 });

    const shiftIds = shifts.map((shift) => shift._id);
    const issueFilter = { shift: { $in: shiftIds } };
    const parameterFilter = { shiftId: { $in: shiftIds } };

    if (issueStatus) issueFilter.status = issueStatus;

    if (parameterCategory) {
      const templates = await ParameterTemplate.find({
        category: parameterCategory,
      }).select("_id");

      parameterFilter.parameterId = {
        $in: templates.map((template) => template._id),
      };
    }

    const [parameters, events, issues] = await Promise.all([
      ParameterEntry.find(parameterFilter).populate("parameterId"),
      EventLog.find({ shift: { $in: shiftIds } })
        .populate("unit", "name")
        .populate("createdBy", "name"),
      Issue.find(issueFilter)
        .populate("unit", "name")
        .populate("department", "name")
        .populate("createdBy", "name")
        .populate("resolvedBy", "name"),
    ]);

    const shiftStatusCounts = shifts.reduce((counts, shift) => {
      counts[shift.status] = (counts[shift.status] || 0) + 1;
      return counts;
    }, {});

    const issueStatusCounts = issues.reduce((counts, issue) => {
      counts[issue.status] = (counts[issue.status] || 0) + 1;
      return counts;
    }, {});

    res.status(200).json({
      success: true,
      data: {
        filters: {
          startDate,
          endDate,
          plant,
          unit,
          issueStatus,
          parameterCategory,
        },
        summary: {
          shifts: shifts.length,
          parameters: parameters.length,
          events: events.length,
          issues: issues.length,
          shiftStatusCounts,
          issueStatusCounts,
        },
        shifts,
        parameters: normalizeParameterEntries(parameters),
        events,
        issues,
      },
    });
  } catch (error) {
    console.error("DATE RANGE REPORT ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to generate date range report",
    });
  }
};
