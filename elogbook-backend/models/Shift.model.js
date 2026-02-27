import mongoose from "mongoose";

const shiftSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true
    },
    shiftType: {
      type: String,
      enum: ["A", "B", "C"],
      required: true
    },
    plant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plant",
      required: true
    },
    unit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Unit",
      required: true
    },
    shiftInCharge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    engineers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    status: {
      type: String,
      enum: ["draft", "submitted", "approved", "locked", "closed"],
      default: "draft"
    },
    submittedBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User" },
    submittedAt: Date,

    approvedBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User" },
    approvedAt: Date,

    lockedBy: { 
      type: mongoose.Schema.Types.ObjectId,
      ref: "User" },
    lockedAt: Date,

    closedBy: {
       type: mongoose.Schema.Types.ObjectId,
       ref: "User" },
    closedAt: Date,

    handoverRemarks: {
      type: String,
      trim: true
    },

  },
  { timestamps: true }
);


const Shift = mongoose.model("Shift", shiftSchema);

export default Shift;