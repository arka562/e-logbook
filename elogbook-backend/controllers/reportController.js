import Shift from "../models/Shift.model.js";
import ParameterEntry from "../models/ParameterTemplate.model.js";
import EventLog from "../models/EventLog.model.js";
import Issue from "../models/Issue.model.js";

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