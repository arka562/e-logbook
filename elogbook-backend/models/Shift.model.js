import mongoose from "mongoose";

const shiftSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    shiftType: {
      type: String,
      enum: ["A", "B", "C"],
      required: true,
    },
    plant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plant",
      required: true,
    },
    unit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Unit",
      required: true,
    },
    shiftInCharge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    engineers: [
      {
        name: String,
        role: String,
      },
    ],
    status: {
      type: String,
      enum: ["draft", "submitted", "approved", "locked","close"],
      default: "draft",
    },
  },
  { timestamps: true }
);

const Shift = mongoose.model("Shift", shiftSchema);

export default Shift;