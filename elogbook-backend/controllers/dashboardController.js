import Shift from "../models/Shift.model.js";
import Issue from "../models/Issue.model.js";
import EventLog from "../models/EventLog.model.js";
import ParameterEntry from "../models/ParameterEntry.mode.js"; 

export const getDashboardSummary = async (req, res) => {
  try {
    const { plant } = req.query;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date();
    yesterday.setHours(yesterday.getHours() - 24);

    const filterShift = {
      createdAt: { $gte: today }, 
    };

    if (plant) filterShift.plant = plant;

    const filterIssue = {};
    const filterEvent = {};
    const filterEntry = {};

    // ⚠️ ONLY use if plant exists in schema
    if (plant) {
      filterEvent.plant = plant;
      filterEntry.plant = plant;
      // filterIssue.plant = plant; ❌ remove if not present
    }

    const [
      totalShiftsToday,
      openIssues,
      wipIssues,
      closedIssues,
      totalEventsToday,
      totalEntriesToday,
      pendingApprovalShifts,
      criticalOpenIssues,
      missingHandoverShifts,
      oldUnresolvedIssues
    ] = await Promise.all([
      Shift.countDocuments(filterShift),

      Issue.countDocuments({ ...filterIssue, status: "open" }),
      Issue.countDocuments({ ...filterIssue, status: "wip" }),
      Issue.countDocuments({ ...filterIssue, status: "closed" }),

      EventLog.countDocuments({
        ...filterEvent,
        createdAt: { $gte: today },
      }),

      ParameterEntry.countDocuments({
        ...filterEntry,
        createdAt: { $gte: today },
      }),

      Shift.find({ status: "submitted" })
        .populate("plant", "name")
        .populate("unit", "name")
        .sort({ updatedAt: -1 })
        .limit(5),

      Issue.find({
        status: { $in: ["open", "wip"] },
        priority: "critical",
      })
        .populate("unit", "name")
        .populate("department", "name")
        .sort({ createdAt: -1 })
        .limit(5),

      Shift.find({
        status: { $in: ["submitted", "approved"] },
        $or: [
          { handoverRemarks: { $exists: false } },
          { handoverRemarks: "" },
        ],
      })
        .populate("plant", "name")
        .populate("unit", "name")
        .sort({ updatedAt: -1 })
        .limit(5),

      Issue.find({
        status: { $in: ["open", "wip"] },
        createdAt: { $lte: yesterday },
      })
        .populate("unit", "name")
        .populate("department", "name")
        .sort({ createdAt: 1 })
        .limit(5),
    ]);

    res.status(200).json({
      success: true,
      data: {
        shifts: { today: totalShiftsToday },
        issues: {
          open: openIssues,
          wip: wipIssues,
          closed: closedIssues,
        },
        events: { today: totalEventsToday },
        parameterEntries: { today: totalEntriesToday },
        pendingWork: {
          pendingApprovalShifts,
          criticalOpenIssues,
          missingHandoverShifts,
          oldUnresolvedIssues,
        },
      },
    });

  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
