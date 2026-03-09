import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      enum: [
        "CREATE",
        "UPDATE",
        "DELETE",
        "SUBMIT",
        "APPROVE",
        "LOCK",
        "LOGIN",
        "LOGOUT"
      ],
      required: true
    },

    module: {
      type: String,
      enum: ["SHIFT", "ISSUE", "EVENT", "USER", "PARAMETER"],
      required: true
    },

    entityId: {
      type: mongoose.Schema.Types.ObjectId
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    userRole: {
      type: String
    },

    description: {
      type: String
    },

    oldData: {
      type: mongoose.Schema.Types.Mixed
    },

    newData: {
      type: mongoose.Schema.Types.Mixed
    },

    ipAddress: {
      type: String
    }
  },
  { timestamps: true }
);

const AuditLog = mongoose.model("AuditLog", auditLogSchema);

export default AuditLog;