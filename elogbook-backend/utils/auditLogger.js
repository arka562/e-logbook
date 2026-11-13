import AuditLog from "../models/AuditLog.model.js";

export const logAudit = async ({
  action,
  module,
  entity,
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
      module: module || entity,
      entityId,
      user: userId,
      userRole,
      description,
      oldData,
      newData,
      ipAddress
    });
  } catch (error) {
    // Deliberate trade-off: audit logging is fail-open. A failed
    // audit write must NOT fail the underlying plant-floor operation
    // (an operator's issue report matters more than its log row),
    // but the gap must be impossible to miss in the server logs —
    // a silent gap in an audit trail is worse than a loud one,
    // because reviewers trust the trail to be complete. Grep for
    // AUDIT FAILURE in production logs to find every gap.
    // (The strict alternative — operation and audit in one MongoDB
    // transaction — needs a replica set and is a deployment change,
    // not just a code change.)
    console.error(
      `AUDIT FAILURE: could not record ${action} on ${module || entity} (entityId: ${entityId}) — audit trail has a gap for this operation.`,
      error
    );
  }
};
