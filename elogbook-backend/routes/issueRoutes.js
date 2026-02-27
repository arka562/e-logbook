import express from "express";
import {
  createIssue,
  deleteIssue,
  getIssuesByShift,
  updateIssueStatus
} from "../controllers/issueController.js";

import { helper, roleAuthorization } from "../middleware/authMiddleware.js";

const router = express.Router();


router.post(
  "/",
  helper,
  roleAuthorization("operator", "shift_incharge", "admin", "hod"),
  createIssue
);

router.get(
  "/shift/:shiftId",
  helper,
  getIssuesByShift
);

router.patch(
  "/:issueId/status",
  helper,
  roleAuthorization("admin", "hod", "shift_incharge"),
  updateIssueStatus
);

router.delete(
  "/:issueId",
  helper,
  roleAuthorization("admin", "hod"),
  deleteIssue
);

export default router;