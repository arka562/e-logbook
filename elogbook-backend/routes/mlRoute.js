import express from "express";
import { detectAnomaly } from "../controllers/mlController.js";
import { helper } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/anomaly", helper, detectAnomaly);

export default router;