import Shift from "../models/Shift.model.js";
import Plant from "../models/Plant.model.js";
import Unit from "../models/Unit.model.js";
import User from "../models/User.model.js";
import { logAudit } from "../utils/auditLogger.js";
console.log("Controller hit");
/* ================= CREATE SHIFT ================= */
export const createShift = async (req, res) => {
  try {
    const { date, shiftType, plant, unit, engineers } = req.body;

    if (!date || !shiftType || !plant || !unit) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing",
      });
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    const unitExists = await Unit.findById(unit);

if (!unitExists) {
  return res.status(400).json({
    success: false,
    message: "Unit not found",
  });
}

// ✅ CHECK RELATION
if (unitExists.plant.toString() !== plant) {
  return res.status(400).json({
    success: false,
    message: "Selected unit does not belong to selected plant",
  });
}

    const shiftDate = new Date(date);
    shiftDate.setHours(0, 0, 0, 0);

    const existingShift = await Shift.findOne({
      date: {
        $gte: shiftDate,
        $lt: new Date(shiftDate.getTime() + 86400000),
      },
      unit,
      shiftType,
    });

    if (existingShift) {
      return res.status(400).json({
        success: false,
        message: "Shift already exists",
      });
    }

    const shift = await Shift.create({
      date: shiftDate,
      shiftType,
      plant,
      unit,
      shiftInCharge: req.user._id,
      engineers: engineers || [],
      status: "draft",
    });

    res.status(201).json({
      success: true,
      message: "Shift created successfully",
      data: shift,
    });

  } catch (error) {
    console.error("Create Shift Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/* ================= GET SHIFTS ================= */
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
      data: shifts,
    });
  } catch (error) {
    console.error("Get Shifts Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ================= GET SHIFT BY ID ================= */
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
        message: "Shift not found",
      });
    }

    res.status(200).json({
      success: true,
      data: shift,
    });
  } catch (error) {
    console.error("Get Shift By ID Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ================= DELETE SHIFT ================= */
export const deleteShift = async (req, res) => {
  try {
    const shift = await Shift.findByIdAndDelete(req.params.id);

    if (!shift) {
      return res.status(404).json({
        success: false,
        message: "Shift not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Shift deleted successfully",
    });
  } catch (error) {
    console.error("Delete Shift Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ================= SUBMIT SHIFT ================= */
export const submitShift = async (req, res) => {
  try {
    const { shiftId } = req.params;
    const shift = await Shift.findById(shiftId);

    if (!shift) {
      return res.status(404).json({ success: false, message: "Shift not found" });
    }

    if (shift.status !== "draft") {
      return res.status(400).json({
        success: false,
        message: "Only draft shift can be submitted",
      });
    }

    shift.status = "submitted";
    shift.submittedBy = req.user._id;
    shift.submittedAt = new Date();

    await shift.save();

    await logAudit({
      action: "SUBMIT",
      entity: "SHIFT",
      entityId: shift._id,
      userId: req.user._id,
      description: `Shift submitted`,
      userRole: req.user.role,
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      message: "Shift submitted successfully",
      data: shift,
    });
  } catch (error) {
    console.error("Submit Shift Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ================= APPROVE SHIFT ================= */
export const approveShift = async (req, res) => {
  try {
    const { shiftId } = req.params;
    const shift = await Shift.findById(shiftId);

    if (!shift) {
      return res.status(404).json({ success: false, message: "Shift not found" });
    }

    if (shift.status !== "submitted") {
      return res.status(400).json({
        success: false,
        message: "Only submitted shift can be approved",
      });
    }

    shift.status = "approved";
    shift.approvedBy = req.user._id;
    shift.approvedAt = new Date();

    await shift.save();

    await logAudit({
      action: "APPROVE",
      entity: "SHIFT",
      entityId: shift._id,
      userId: req.user._id,
      description: `Shift approved`,
      userRole: req.user.role,
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      message: "Shift approved successfully",
      data: shift,
    });
  } catch (error) {
    console.error("Approve Shift Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ================= LOCK SHIFT ================= */
export const lockShift = async (req, res) => {
  try {
    const { shiftId } = req.params;
    const shift = await Shift.findById(shiftId);

    if (!shift) {
      return res.status(404).json({ success: false, message: "Shift not found" });
    }

    if (shift.status !== "approved") {
      return res.status(400).json({
        success: false,
        message: "Only approved shift can be locked",
      });
    }

    shift.status = "locked";
    shift.lockedBy = req.user._id;
    shift.lockedAt = new Date();

    await shift.save();

    await logAudit({
      action: "LOCK",
      entity: "SHIFT",
      entityId: shift._id,
      userId: req.user._id,
      description: `Shift locked`,
      userRole: req.user.role,
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      message: "Shift locked successfully",
      data: shift,
    });
  } catch (error) {
    console.error("Lock Shift Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ================= UPDATE HANDOVER REMARKS ================= */
export const updateHandoverRemarks = async (req, res) => {
  try {
    const { shiftId } = req.params;
    const { handoverRemarks } = req.body;

    if (typeof handoverRemarks !== "string" || !handoverRemarks.trim()) {
      return res.status(400).json({
        success: false,
        message: "Handover remarks are required",
      });
    }

    const shift = await Shift.findById(shiftId);

    if (!shift) {
      return res.status(404).json({
        success: false,
        message: "Shift not found",
      });
    }

    if (shift.status === "locked" || shift.status === "closed") {
      return res.status(400).json({
        success: false,
        message: "Handover remarks cannot be changed after shift is locked or closed",
      });
    }

    shift.handoverRemarks = handoverRemarks.trim();
    await shift.save();

    await logAudit({
      action: "UPDATE_HANDOVER",
      entity: "SHIFT",
      entityId: shift._id,
      userId: req.user._id,
      description: "Shift handover remarks updated",
      userRole: req.user.role,
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      message: "Handover remarks updated successfully",
      data: shift,
    });
  } catch (error) {
    console.error("Update Handover Remarks Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
