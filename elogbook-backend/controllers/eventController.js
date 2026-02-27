import EventLog from "../models/EventLog.model.js";
import Shift from "../models/Shift.model.js";
import Unit from "../models/Unit.model.js";

export const createEvent = async (req, res) => {
  try {
    const { shiftId, unitId, description } = req.body;

    if (!shiftId || !unitId || !description) {
      return res.status(400).json({
        success: false,
        message: "Shift ID, Unit ID and description are required"
      });
    }

    const shift = await Shift.findById(shiftId);
    if (!shift) {
      return res.status(404).json({
        success: false,
        message: "Shift not found"
      });
    }

    if (shift.status === "locked") {
      return res.status(400).json({
        success: false,
        message: "Shift is locked. Cannot add event."
      });
    }

    const unit = await Unit.findById(unitId);
    if (!unit) {
      return res.status(404).json({
        success: false,
        message: "Unit not found"
      });
    }

    if (unit._id.toString() !== shift.unit.toString()) {
      return res.status(400).json({
        success: false,
        message: "Unit does not belong to this shift"
      });
    }

    const event = await EventLog.create({
      shift: shiftId,
      unit: unitId,
      description,
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      data: event
    });

  } catch (error) {
    console.error("CREATE EVENT ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};