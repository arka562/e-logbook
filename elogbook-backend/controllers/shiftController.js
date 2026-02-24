import Shift from "../models/Shift.model.js";
import Plant from "../models/Plant.model.js";
import Unit from "../models/Unit.model.js";
import User from "../models/User.model.js";

export const createShift = async (req, res) => {
  try {
    const {
      date,
      shiftType,
      plant,
      unit,
      shiftInCharge,
      engineers,
    } = req.body;

    if (!date || !shiftType || !plant || !unit || !shiftInCharge) {
      return res.status(400).json({
        success: false,
        message: "Date, shift type, plant, unit and shift in-charge are required"
      });
    }

    const plantExists = await Plant.findById(plant);
    if (!plantExists) {
      return res.status(404).json({
        success: false,
        message: "Plant not found"
      });
    }

    const unitExists = await Unit.findById(unit);
    if (!unitExists) {
      return res.status(404).json({
        success: false,
        message: "Unit not found"
      });
    }

    const existingShift = await Shift.findOne({
      date,
      unit,
      shiftType
    });

    if (existingShift) {
      return res.status(400).json({
        success: false,
        message: "Shift already created for this unit and shift type on this date"
      });
    }

    const inCharge = await User.findById(shiftInCharge);
    if (!inCharge) {
      return res.status(404).json({
        success: false,
        message: "Shift In-Charge not found"
      });
    }

    const shift = await Shift.create({
      date,
      shiftType,
      plant,
      unit,
      shiftInCharge,
      engineers
    });

    res.status(201).json({
      success: true,
      message: "Shift created successfully",
      data: shift
    });

  } catch (error) {
    console.error("CREATE SHIFT ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};