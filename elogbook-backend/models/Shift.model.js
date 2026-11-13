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
    name: String,
    role: String
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

// One shift per (day, unit, shift type). createShift stores `date`
// normalized to local midnight, so exact-match uniqueness is safe.
// This database-level index closes the race in the controller's
// find-then-create duplicate check: two simultaneous requests can
// both pass that check, but only one insert can win this index.
// NOTE for existing databases: if duplicate shifts already exist,
// this index build will fail until the duplicates are removed.
shiftSchema.index(
  { date: 1, unit: 1, shiftType: 1 },
  { unique: true }
);

const Shift = mongoose.model("Shift", shiftSchema);

export default Shift;