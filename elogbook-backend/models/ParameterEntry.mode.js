import mongoose from "mongoose";

const parameterEntrySchema = new mongoose.Schema(
  {
    shiftId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shift",
      required: true,
    },

    parameterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ParameterTemplate",
      required: true,
    },

    unit1Value: String,
    unit2Value: String,
  },
  { timestamps: true }
);

export default mongoose.model("ParameterEntry", parameterEntrySchema);