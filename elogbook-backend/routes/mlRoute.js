import express from "express";
import { detectAnomaly,predictiveMaintenance  } from "../controllers/mlController.js";
import { helper } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/anomaly", helper, detectAnomaly);
router.get("/predictive-maintenance", helper, predictiveMaintenance);

export default router;