import mongoose from "mongoose";

const parameterTemplateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: [
        "shift_parameters",
        "electrical",
        "switchyard",
        "fire_system",
        "equipment_status"
      ],
      required: true,
    },
    unit: {
      type: String, // MW, kg/cm2, °C etc.
    },
    designValue: {
      type: String,
    },
    plant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plant",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { timestamps: true }
);

const ParameterTemplate = mongoose.model(
  "ParameterTemplate",
  parameterTemplateSchema
);

export default ParameterTemplate;