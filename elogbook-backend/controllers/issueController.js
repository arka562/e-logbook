import Issue from "../models/Issue.model.js";
import Shift from "../models/Shift.model.js";
import Unit from "../models/Unit.model.js";
import Department from "../models/Department.model.js";

export const createIssue = async (req, res) => {
  try {
    const { shiftId, unitId, equipment, description, department } = req.body;

    if (!shiftId || !unitId || !equipment || !description || !department) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided"
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
        message: "Shift is locked. Cannot create issue."
      });
    }

    const unit = await Unit.findById(unitId);
    if (!unit) {
      return res.status(404).json({
        success: false,
        message: "Unit not found"
      });
    }

    const dept = await Department.findById(department);
    if (!dept) {
      return res.status(404).json({
        success: false,
        message: "Department not found"
      });
    }

    const issue = await Issue.create({
      shift: shiftId,
      unit: unitId,
      department,
      equipment,
      description,
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: "Issue created successfully",
      data: issue
    });

  } catch (error) {
    console.error("CREATE ISSUE ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
export const getIssues = async (req, res) => {
  try {
    const {
      status,
      unit,
      plant,
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

    const issues = await Issue.find(filter)
      .populate("unit", "name")
      .populate("createdBy", "name role")
      .populate("resolvedBy", "name role")
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean();

    const total = await Issue.countDocuments(filter);

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: issues
    });

  } catch (error) {
    console.error("GET ISSUES ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

export const getIssuesByShift = async (req, res) => {
  try {
    const { shiftId } = req.params;
    const { status, page = 1, limit = 10 } = req.query;

    const filter = { shift: shiftId };
    if (status) filter.status = status;

    const issues = await Issue.find(filter)
      .populate("createdBy", "name role")
      .populate("resolvedBy", "name role")
      .populate("unit", "name")
      .populate("department", "name")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Issue.countDocuments(filter);

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      data: issues
    });

  } catch (error) {
    console.error("GET ISSUES ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

export const updateIssueStatus = async (req, res) => {
  try {
    const { issueId } = req.params;
    const { status } = req.body;

    const validStatuses = ["open", "wip", "closed"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value"
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

    if (issue.status === "open" && status === "wip") {
      issue.status = "wip";
    }
    else if (issue.status === "wip" && status === "closed") {
      issue.status = "closed";
      issue.resolvedBy = req.user._id;
      issue.resolvedAt = new Date();
    }
    else if (issue.status === "open" && status === "closed") {
      if (["admin", "hod"].includes(req.user.role)) {
        issue.status = "closed";
        issue.resolvedBy = req.user._id;
        issue.resolvedAt = new Date();
      } else {
        return res.status(403).json({
          success: false,
          message: "Only Admin or HOD can directly close an open issue"
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
      message: "Issue status updated successfully",
      data: issue
    });

  } catch (error) {
    console.error("UPDATE ISSUE ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};


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

    await issue.save();

    res.status(200).json({
      success: true,
      message: "Issue deleted successfully"
    });

  } catch (error) {
    console.error("DELETE ISSUE ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};