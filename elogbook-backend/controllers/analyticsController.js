import ParameterEntry from "../models/ParameterEntry.mode.js";
import Issue from "../models/Issue.model.js";
import mongoose from "mongoose";

export const getParameterTrends = async (req, res) => {
  try {
    const { parameterId, startDate, endDate } = req.query;

    if (!parameterId) {
      return res.status(400).json({
        success: false,
        message: "Parameter ID is required",
      });
    }
    console.log("PARAM ID:", parameterId);

    if (!mongoose.Types.ObjectId.isValid(parameterId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Parameter ID format",
      });
    }

    // ✅ FIXED FIELD NAME
    const query = {
      parameterId: parameterId,
    };

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const data = await ParameterEntry.find(query)
      .sort({ createdAt: 1 })
      .select("unit1Value createdAt parameterId")
      .populate("parameterId", "name unit") // ✅ FIXED
      .lean();
    console.log("RAW DATA:", data);
    if (!data.length) {
      return res.status(404).json({
        success: false,
        message: "No data found for this parameter",
      });
    }

    const formattedData = data.map((entry) => ({
      timestamp: entry.createdAt,
      value: Number(entry.unit1Value),
      parameter: {
        name: entry.parameterId?.name,
        unit: entry.parameterId?.unit,
      },
    }));

    return res.status(200).json({
      success: true,
      count: formattedData.length,
      data: formattedData,
    });

  } catch (error) {
    console.error("Error fetching parameter trends:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};


export const getEfficiency = async (req, res) => {
  try {
    const { parameterId, startDate, endDate } = req.query;

    if (parameterId && !mongoose.Types.ObjectId.isValid(parameterId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid parameterId format",
      });
    }

    const matchStage = {};

    if (parameterId) {
      matchStage.parameterId = new mongoose.Types.ObjectId(parameterId);
    }

    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = new Date(startDate);
      if (endDate) matchStage.createdAt.$lte = new Date(endDate);
    }

    const efficiencyData = await ParameterEntry.aggregate([
      { $match: matchStage },

      {
        $lookup: {
          from: "parametertemplates", 
          localField: "parameterId",
          foreignField: "_id",
          as: "parameter",
        },
      },
      { $unwind: "$parameter" },

      {
  $addFields: {
    actual: {
      $convert: {
        input: "$unit1Value",
        to: "double",
        onError: 0,   // ✅ handles ""
        onNull: 0,
      },
    },
    design: {
      $convert: {
        input: "$parameter.designValue",
        to: "double",
        onError: 0,
        onNull: 0,
      },
    },
  },
},

      {
        $addFields: {
          efficiency: {
            $cond: [
              { $gt: ["$design", 0] },
              {
                $round: [
                  { $multiply: [{ $divide: ["$actual", "$design"] }, 100] },
                  2,
                ],
              },
              0,
            ],
          },
        },
      },

      {
        $project: {
          _id: 0,
          parameterName: "$parameter.name",
          actual: 1,
          design: 1,
          efficiency: 1,
          timestamp: "$createdAt",
        },
      },

      { $sort: { timestamp: 1 } },
    ]);

    if (!efficiencyData.length) {
      return res.status(404).json({
        success: false,
        message: "No efficiency data found",
      });
    }

    return res.status(200).json({
      success: true,
      count: efficiencyData.length,
      data: efficiencyData,
    });

  } catch (error) {
    console.error("Efficiency API Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};


export const getIssueStats = async (req, res) => {
  try {
    const { startDate, endDate, status, unitId, departmentId } = req.query;

    const matchStage = {};

    if (status) {
      matchStage.status = status;
    }

    if (unitId && mongoose.Types.ObjectId.isValid(unitId)) {
      matchStage.unit = new mongoose.Types.ObjectId(unitId);
    }

    if (departmentId && mongoose.Types.ObjectId.isValid(departmentId)) {
      matchStage.department = new mongoose.Types.ObjectId(departmentId);
    }

    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = new Date(startDate);
      if (endDate) matchStage.createdAt.$lte = new Date(endDate);
    }

    const stats = await Issue.aggregate([
      { $match: matchStage },

      {
        $addFields: {
          equipmentNormalized: { $toLower: "$equipment" },
        },
      },

      {
        $group: {
          _id: "$equipmentNormalized",
          count: { $sum: 1 },
        },
      },

      { $sort: { count: -1 } },

      {
        $group: {
          _id: null,
          total: { $sum: "$count" },
          data: { $push: { equipment: "$_id", count: "$count" } },
        },
      },

      { $unwind: "$data" },

      {
        $addFields: {
          "data.percentage": {
            $round: [
              {
                $multiply: [
                  { $divide: ["$data.count", "$total"] },
                  100,
                ],
              },
              2,
            ],
          },
        },
      },

      {
        $project: {
          _id: 0,
          equipment: "$data.equipment",
          count: "$data.count",
          percentage: "$data.percentage",
        },
      },

      { $sort: { count: -1 } },
    ]);

    if (!stats.length) {
      return res.status(404).json({
        success: false,
        message: "No issue data found",
      });
    }

    return res.status(200).json({
      success: true,
      count: stats.length,
      data: stats,
    });

  } catch (error) {
    console.error("Issue Stats Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};