import express from "express";
import { getDashboardSummary } from "../controllers/dashboardController.js";
import { helper } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", helper, getDashboardSummary);

export default router;