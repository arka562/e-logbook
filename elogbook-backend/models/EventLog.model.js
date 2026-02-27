import mongoose from "mongoose";

const eventLogSchema = new mongoose.Schema(
  {
    shift: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shift",
      required: true,
    },
    unit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Unit",
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true } 
);

const EventLog = mongoose.model("EventLog", eventLogSchema);

export default EventLog;