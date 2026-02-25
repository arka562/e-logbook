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

export const getShifts = async (req, res) => {
  try {
    const { plant, unit, date } = req.query;

    const filter = {};
    if (plant) filter.plant = plant;
    if (unit) filter.unit = unit;
    if (date) filter.date = date;

    const shifts = await Shift.find(filter)
      .populate("plant", "name")
      .populate("unit", "name")
      .populate("shiftInCharge", "name role");

    res.status(200).json({
      success: true,
      count: shifts.length,
      data: shifts
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

export const getShiftById = async (req, res) => {
  try {
    const shift = await Shift.findById(req.params.id)
      .populate("plant")
      .populate("unit")
      .populate("shiftInCharge")
      .populate("engineers");

    if (!shift) {
      return res.status(404).json({
        success: false,
        message: "Shift not found"
      });
    }

    res.status(200).json({
      success: true,
      data: shift
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

export const closeShift = async (req, res) => {
  try {
    const shift = await Shift.findById(req.params.id);

    if (!shift) {
      return res.status(404).json({
        success: false,
        message: "Shift not found"
      });
    }

    shift.status = "closed";
    await shift.save();

    res.status(200).json({
      success: true,
      message: "Shift closed successfully",
      data: shift
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

export const deleteShift = async (req, res) => {
  try {
    const shift = await Shift.findByIdAndDelete(req.params.id);

    if (!shift) {
      return res.status(404).json({
        success: false,
        message: "Shift not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Shift deleted successfully"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};