import express from "express";
import { getAuditLogs } from "../controllers/auditController.js";
import { helper,roleAuthorization } from "../middleware/authMiddleware.js";
import asyncHandler from "../middleware/asyncHandler.js";

const router = express.Router();

router.get(
  "/",
  helper,
  roleAuthorization("admin", "hod"),
  asyncHandler(getAuditLogs)
);

export default router;