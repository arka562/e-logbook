import Shift from "../models/Shift.model.js";
import Issue from "../models/Issue.model.js";
import EventLog from "../models/EventLog.model.js";
import ParameterEntry from "../models/ParameterTemplate.model.js";

export const getDashboardSummary = async (req, res) => {
  try {
    const { plant } = req.query;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const filterShift = {
      date: { $gte: today },
    };

    if (plant) filterShift.plant = plant;

    const filterIssue = {};
    const filterEvent = {};
    const filterEntry = {};

    if (plant) {
      filterIssue.plant = plant;
      filterEvent.plant = plant;
      filterEntry.plant = plant;
    }

    const [
      totalShiftsToday,
      openIssues,
      wipIssues,
      closedIssues,
      totalEventsToday,
      totalEntriesToday
    ] = await Promise.all([
      Shift.countDocuments(filterShift),

      Issue.countDocuments({ ...filterIssue, status: "open" }),
      Issue.countDocuments({ ...filterIssue, status: "wip" }),
      Issue.countDocuments({ ...filterIssue, status: "closed" }),

      EventLog.countDocuments({ createdAt: { $gte: today } }),
      ParameterEntry.countDocuments({ createdAt: { $gte: today } })
    ]);

    res.status(200).json({
      success: true,
      data: {
        shifts: {
          today: totalShiftsToday
        },
        issues: {
          open: openIssues,
          wip: wipIssues,
          closed: closedIssues,
        },
        events: {
          today: totalEventsToday
        },
        parameterEntries: {
          today: totalEntriesToday
        }
      }
    });

  } catch (error) {
    console.error("DASHBOARD ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};