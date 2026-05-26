import mongoose from "mongoose";
import Issue from "../models/Issue.model.js";
import Shift from "../models/Shift.model.js";
import Unit from "../models/Unit.model.js";
import Department from "../models/Department.model.js";

export const createIssue = async (req, res) => {
  try {
    const { shiftId, unitId, equipment, description, department, priority = "medium" } = req.body;
    const validPriorities = ["low", "medium", "high", "critical"];

    // ✅ Auth check
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // ✅ Required fields
    if (!shiftId || !unitId || !equipment || !description || !department) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    if (!validPriorities.includes(priority)) {
      return res.status(400).json({
        success: false,
        message: "Invalid issue priority",
      });
    }

    // ✅ ObjectId validation
    if (
      !mongoose.Types.ObjectId.isValid(shiftId) ||
      !mongoose.Types.ObjectId.isValid(unitId) ||
      !mongoose.Types.ObjectId.isValid(department)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format",
      });
    }

    // ✅ Shift check
    const shift = await Shift.findById(shiftId);
    if (!shift) {
      return res.status(404).json({
        success: false,
        message: "Shift not found",
      });
    }

    // ✅ Locked check
    if (shift.status === "locked") {
      return res.status(400).json({
        success: false,
        message: "Shift is locked",
      });
    }

    // ✅ Unit check
    const unit = await Unit.findById(unitId);
    if (!unit) {
      return res.status(404).json({
        success: false,
        message: "Unit not found",
      });
    }

    // ✅ Department check
    const dept = await Department.findById(department);
    if (!dept) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    // ✅ RELATION CHECK
    if (!shift.unit || shift.unit.toString() !== unitId) {
      return res.status(400).json({
        success: false,
        message: "Unit does not belong to this shift",
      });
    }

    // ✅ Create issue
    const issue = await Issue.create({
      shift: shiftId,
      unit: unitId,
      department,
      equipment,
      description,
      priority,
      createdBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Issue created successfully",
      data: issue,
    });

  } catch (error) {
    console.error("Create Issue Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};



// ✅ GET ALL ISSUES
export const getIssues = async (req, res) => {
  try {
    const {
      status,
      unit,
      startDate,
      endDate,
      page = 1,
      limit = 10
    } = req.query;

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;

    let filter = {};

    if (status) filter.status = status;
    if (unit) filter.unit = unit;

    if (startDate || endDate) {
      filter.createdAt = {};

      if (startDate) filter.createdAt.$gte = new Date(startDate);

      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    if (req.user.role === "operator") {
      filter.createdBy = req.user._id;
    }

    const issues = await Issue.find(filter)
      .populate("unit", "name")
      .populate("department", "name")
      .populate("createdBy", "name role")
      .populate("resolvedBy", "name role")
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    const total = await Issue.countDocuments(filter);

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      data: issues
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// ✅ GET ISSUES BY SHIFT
export const getIssuesByShift = async (req, res) => {
  try {
    const { shiftId } = req.params;
    const { status, page = 1, limit = 10 } = req.query;

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;

    const filter = { shift: shiftId };
    if (status) filter.status = status;

    const issues = await Issue.find(filter)
      .populate("unit", "name")
      .populate("department", "name")
      .populate("createdBy", "name role")
      .populate("resolvedBy", "name role")
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    const total = await Issue.countDocuments(filter);

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      data: issues
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// ✅ UPDATE ISSUE STATUS
export const updateIssueStatus = async (req, res) => {
  try {
    const { issueId } = req.params;
    const { status, closureRemarks } = req.body;

    const validStatuses = ["open", "wip", "closed"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status"
      });
    }

    const issue = await Issue.findById(issueId);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found"
      });
    }

    if (issue.status === "closed") {
      return res.status(400).json({
        success: false,
        message: "Closed issue cannot be modified"
      });
    }

    if (req.user.role === "operator" && status === "closed") {
      return res.status(403).json({
        success: false,
        message: "Operators cannot close issues"
      });
    }

    if (status === "closed" && (!closureRemarks || !closureRemarks.trim())) {
      return res.status(400).json({
        success: false,
        message: "Closure remarks are required to close an issue"
      });
    }

    if (issue.status === "open" && status === "wip") {
      issue.status = "wip";
    }
    else if (issue.status === "wip" && status === "closed") {
      issue.status = "closed";
      issue.resolvedBy = req.user._id;
      issue.resolvedAt = new Date();
      issue.closureRemarks = closureRemarks.trim();
    }
    else if (issue.status === "open" && status === "closed") {
      if (["admin", "hod"].includes(req.user.role)) {
        issue.status = "closed";
        issue.resolvedBy = req.user._id;
        issue.resolvedAt = new Date();
        issue.closureRemarks = closureRemarks.trim();
      } else {
        return res.status(403).json({
          success: false,
          message: "Only Admin or HOD can close directly"
        });
      }
    }
    else {
      return res.status(400).json({
        success: false,
        message: "Invalid status transition"
      });
    }

    await issue.save();

    res.status(200).json({
      success: true,
      message: "Issue status updated",
      data: issue
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// ✅ DELETE ISSUE (HARD DELETE)
export const deleteIssue = async (req, res) => {
  try {
    const { issueId } = req.params;

    const issue = await Issue.findById(issueId);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found"
      });
    }

    await issue.deleteOne();

    res.status(200).json({
      success: true,
      message: "Issue deleted successfully"
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
