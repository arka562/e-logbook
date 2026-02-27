import mongoose from "mongoose";

const issueSchema = new mongoose.Schema(
  {
    shift: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shift",
      required: true
    },
    unit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Unit",
      required: true
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true
    },
    equipment: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: ["open", "wip", "closed"],
      default: "open"
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    resolvedAt: {
      type: Date
    },
  },
  { timestamps: true }
);



const Issue = mongoose.model("Issue", issueSchema);

export default Issue;