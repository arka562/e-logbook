import ParameterTemplate from "../models/ParameterTemplate.model.js";
import Plant from "../models/Plant.model.js";



export const createParameterTemplate = async (req, res) => {
    const { name, category, unit, designValue, minValue, maxValue, plant } = req.body;

    if (!name || !category || !plant) {
      return res.status(400).json({
        success: false,
        message: "Name, category and plant are required"
      });
    }

    const parsedMinValue =
      minValue === undefined || minValue === "" ? undefined : Number(minValue);
    const parsedMaxValue =
      maxValue === undefined || maxValue === "" ? undefined : Number(maxValue);

    if (
      (parsedMinValue !== undefined && Number.isNaN(parsedMinValue)) ||
      (parsedMaxValue !== undefined && Number.isNaN(parsedMaxValue))
    ) {
      return res.status(400).json({
        success: false,
        message: "Min and max values must be valid numbers"
      });
    }

    if (
      parsedMinValue !== undefined &&
      parsedMaxValue !== undefined &&
      parsedMinValue > parsedMaxValue
    ) {
      return res.status(400).json({
        success: false,
        message: "Min value cannot be greater than max value"
      });
    }

    const plantExists = await Plant.findById(plant);
    if (!plantExists) {
      return res.status(404).json({
        success: false,
        message: "Plant not found"
      });
    }

    const existingTemplate = await ParameterTemplate.findOne({
      name,
      category,
      plant
    });

    if (existingTemplate) {
      return res.status(400).json({
        success: false,
        message: "Parameter already exists in this category for this plant"
      });
    }

    const template = await ParameterTemplate.create({
      name,
      category,
      unit,
      designValue,
      minValue: parsedMinValue,
      maxValue: parsedMaxValue,
      plant,
      createdBy: req.user?._id
    });

    res.status(201).json({
      success: true,
      message: "Parameter template created successfully",
      data: template
    });
};

export const getTemplatesByCategory = async (req, res) => {
    const { category, plant } = req.query;

    if (!category || !plant) {
      return res.status(400).json({
        success: false,
        message: "Category and plant are required"
      });
    }

    const templates = await ParameterTemplate.find({
      category,
      plant
    }).populate("plant", "name");

    res.status(200).json({
      success: true,
      count: templates.length,
      data: templates
    });
};
