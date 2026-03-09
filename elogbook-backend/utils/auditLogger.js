import AuditLog from "../models/AuditLog.model.js";

export const logAudit = async ({
  action,
  module,
  entityId = null,
  userId = null,
  userRole = null,
  description = "",
  oldData = null,
  newData = null,
  ipAddress = null
}) => {
  try {
    await AuditLog.create({
      action,
      module,
      entityId,
      user: userId,
      userRole,
      description,
      oldData,
      newData,
      ipAddress
    });
  } catch (error) {
    console.error("Audit log failed:", error.message);
  }
};