import express from "express";
import { getAuditLogs } from "../controllers/auditController.js";
import { helper,roleAuthorization } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
  "/",
  helper,
  roleAuthorization("admin", "hod"),
  getAuditLogs
);

export default router;