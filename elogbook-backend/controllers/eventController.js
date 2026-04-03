import EventLog from "../models/EventLog.model.js";
import Shift from "../models/Shift.model.js";
import Unit from "../models/Unit.model.js";

import mongoose from "mongoose";

export const createEvent = async (req, res) => {
  try {
    const { shiftId, unitId, description } = req.body;

    // ✅ Auth check
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // ✅ Required fields
    if (!shiftId || !unitId || !description) {
      return res.status(400).json({
        success: false,
        message: "Shift ID, Unit ID and description are required",
      });
    }

    // ✅ ObjectId validation
    if (
      !mongoose.Types.ObjectId.isValid(shiftId) ||
      !mongoose.Types.ObjectId.isValid(unitId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format",
      });
    }

    const shift = await Shift.findById(shiftId);
    if (!shift) {
      return res.status(404).json({
        success: false,
        message: "Shift not found",
      });
    }

    if (shift.status === "locked") {
      return res.status(400).json({
        success: false,
        message: "Shift is locked. Cannot add event.",
      });
    }

    const unit = await Unit.findById(unitId);
    if (!unit) {
      return res.status(404).json({
        success: false,
        message: "Unit not found",
      });
    }

    // ✅ RELATION CHECK (VERY IMPORTANT)
    if (shift.unit.toString() !== unitId) {
      return res.status(400).json({
        success: false,
        message: "Unit does not belong to this shift",
      });
    }

    const event = await EventLog.create({
      shift: shiftId,
      unit: unitId,
      description,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      data: event,
    });

  } catch (error) {
    console.error("Create Event Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
export const getEvents = async (req, res) => {

    const {
      startDate,
      endDate,
      unit,
      plant,
      page = 1,
      limit = 10
    } = req.query;

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;

    let filter = {};

    if (unit) filter.unit = unit;
    if (plant) filter.plant = plant;

    if (startDate || endDate) {
      filter.createdAt = {};

      if (startDate) {
        const start = new Date(startDate);
        if (isNaN(start.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Invalid startDate"
          });
        }
        filter.createdAt.$gte = start;
      }

      if (endDate) {
        const end = new Date(endDate);
        if (isNaN(end.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Invalid endDate"
          });
        }
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }
    if (req.user.role === "operator") {
      filter.createdBy = req.user._id;
    }
    const events = await EventLog.find(filter)
      .populate("unit", "name")
      .populate("createdBy", "name role")
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean();

    const total = await EventLog.countDocuments(filter);

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: events
    });
};