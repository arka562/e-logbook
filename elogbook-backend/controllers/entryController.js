import mongoose from "mongoose";
import ParameterEntry from "../models/ParameterEntry.mode.js";
import Shift from "../models/Shift.model.js";
import ParameterTemplate from "../models/ParameterTemplate.model.js";

// Validation here follows the same pattern already used by
// issueController.createIssue and eventController.createEvent:
// validate IDs -> referenced shift must exist -> terminal shifts are
// immutable -> referenced parameter must exist and belong to the
// shift's plant. This controller previously skipped all of it and
// created entries against any shiftId/parameterId, including locked
// shifts, which broke the "locked = read-only" rule of the lifecycle.
export const createEntry = async (req, res) => {
  try {
    const { shiftId, parameterId, unit1Value, unit2Value } = req.body;

    if (!shiftId || !parameterId) {
      return res.status(400).json({
        success: false,
        message: "Shift and parameter are required",
      });
    }

    // ObjectId validation
    if (
      !mongoose.Types.ObjectId.isValid(shiftId) ||
      !mongoose.Types.ObjectId.isValid(parameterId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format",
      });
    }

    // Shift must exist
    const shift = await Shift.findById(shiftId);
    if (!shift) {
      return res.status(404).json({
        success: false,
        message: "Shift not found",
      });
    }

    // Locked (and closed) shifts are immutable — no new entries.
    // Matches the guard shiftController.deleteShift already applies.
    if (shift.status === "locked" || shift.status === "closed") {
      return res.status(400).json({
        success: false,
        message: "Cannot add entries to a locked shift",
      });
    }

    // Parameter must exist
    const parameter = await ParameterTemplate.findById(parameterId);
    if (!parameter) {
      return res.status(404).json({
        success: false,
        message: "Parameter not found",
      });
    }

    // Parameter must belong to the same plant as the shift
    if (parameter.plant.toString() !== shift.plant.toString()) {
      return res.status(400).json({
        success: false,
        message: "Parameter does not belong to this shift's plant",
      });
    }

    const entry = await ParameterEntry.create({
      shiftId,
      parameterId,
      unit1Value,
      unit2Value,
    });

    res.status(201).json({
      success: true,
      message: "Entry saved",
      data: entry,
    });

  } catch (error) {
    console.error("ENTRY ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
