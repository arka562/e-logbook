import express from "express";
import { detectAnomaly, getEquipmentIssueRisk } from "../controllers/mlController.js";
import { helper } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/anomaly", helper, detectAnomaly);
router.get("/equipment-risk", helper, getEquipmentIssueRisk);
// Deprecated alias: this endpoint is an issue-frequency count, not
// predictive maintenance. Kept so older clients keep working; new
// clients should use /equipment-risk.
router.get("/predictive-maintenance", helper, getEquipmentIssueRisk);

export default router;
