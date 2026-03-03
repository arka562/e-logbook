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
    const { date, plant, unit, status, page = 1, limit = 10 } = req.query;

    let filter = {};

    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);

      const end = new Date(date);
      end.setHours(23, 59, 59, 999);

      filter.date = { $gte: start, $lte: end };
    }

    if (plant) filter.plant = plant;
    if (unit) filter.unit = unit;
    if (status) filter.status = status;

    const shifts = await Shift.find(filter)
      .populate("plant", "name")
      .populate("unit", "name")
      .populate("shiftInCharge", "name role")
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Shift.countDocuments(filter);

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      data: shifts
    });

  } catch (error) {
    console.error("GET SHIFTS ERROR:", error);
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

export const submitShift = async (req, res) => {
  try {
    const { shiftId } = req.params;
    const shift = await Shift.findById(shiftId);

    if (!shift) {
      return res.status(404).json({
        success: false,
        message: "Shift not found"
      });
    }

    if (shift.status !== "draft") {
      return res.status(400).json({
        success: false,
        message: "Only draft shift can be submitted"
      });
    }

    if (!["operator", "shift_incharge"].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to submit shift"
      });
    }

    shift.status = "submitted";
    shift.submittedBy = req.user._id;
    shift.submittedAt = new Date();

    await shift.save();

    res.status(200).json({
      success: true,
      message: "Shift submitted successfully",
      data: shift
    });

  } catch (error) {
    console.error("SUBMIT SHIFT ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

export const approveShift = async (req, res) => {
  try {
    const { shiftId } = req.params;
    const shift = await Shift.findById(shiftId);

    if (!shift) {
      return res.status(404).json({
        success: false,
        message: "Shift not found"
      });
    }

    if (shift.status !== "submitted") {
      return res.status(400).json({
        success: false,
        message: "Only submitted shift can be approved"
      });
    }

    if (!["shift_incharge", "hod", "admin"].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to approve shift"
      });
    }

    shift.status = "approved";
    shift.approvedBy = req.user._id;
    shift.approvedAt = new Date();

    await shift.save();

    res.status(200).json({
      success: true,
      message: "Shift approved successfully",
      data: shift
    });

  } catch (error) {
    console.error("APPROVE SHIFT ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

export const lockShift = async (req, res) => {
  try {
    const { shiftId } = req.params;

    const shift = await Shift.findById(shiftId);

    if (!shift) {
      return res.status(404).json({
        success: false,
        message: "Shift not found"
      });
    }

    if (shift.status !== "approved") {
      return res.status(400).json({
        success: false,
        message: "Only approved shift can be locked"
      });
    }

    if (!["hod", "admin"].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to lock shift"
      });
    }

    shift.status = "locked";
    shift.lockedBy = req.user._id;
    shift.lockedAt = new Date();

    await shift.save();

    res.status(200).json({
      success: true,
      message: "Shift locked successfully",
      data: shift
    });

  } catch (error) {
    console.error("LOCK SHIFT ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};