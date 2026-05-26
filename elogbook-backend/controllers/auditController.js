import AuditLog from "../models/AuditLog.model.js";

export const getAuditLogs = async (req, res) => {
  const { action, module, userRole, limit = 100 } = req.query;
  const filter = {};

  if (action) filter.action = action;
  if (module) filter.module = module;
  if (userRole) filter.userRole = userRole;

  const logs = await AuditLog.find(filter)
    .populate("user", "name role")
    .sort({ createdAt: -1 })
    .limit(Number(limit) || 100);

  res.status(200).json({
    success: true,
    count: logs.length,
    data: logs,
  });
};
