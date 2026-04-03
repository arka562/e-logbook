import express from "express";
import {
  getParameterTrends,
  getEfficiency,
  getIssueStats,getParameters
} from "../controllers/analyticsController.js";

import { helper} from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/trends", helper, getParameterTrends);
router.get("/efficiency", helper, getEfficiency);
router.get("/issues", helper, getIssueStats);
router.get("/parameters", getParameters);

export default router;