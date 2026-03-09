import AuditLog from "../models/AuditLog.model.js";

export const getAuditLogs = async (req, res) => {
  const logs = await AuditLog.find()
    .populate("user", "name role")
    .sort({ createdAt: -1 });

  res.json(logs);
};