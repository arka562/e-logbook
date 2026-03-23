import ParameterEntry from "../models/ParameterEntry.mode.js";

export const createEntry = async (req, res) => {
  try {
    const { shiftId, parameterId, unit1Value, unit2Value } = req.body;

    if (!shiftId || !parameterId) {
      return res.status(400).json({
        success: false,
        message: "Shift and parameter are required",
      });
    }

    const entry = await ParameterEntry.create({
      shiftId,
      parameterId,
      unit1Value,
      unit2Value,
    });

    res.status(201).json({
      success: true,
      message: "Entry saved",
      data: entry,
    });

  } catch (error) {
    console.error("ENTRY ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};