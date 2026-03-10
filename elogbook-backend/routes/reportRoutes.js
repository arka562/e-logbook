import express from "express";
import { getShiftReport,downloadShiftReport } from "../controllers/reportController.js";
import { helper } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/shift/:shiftId",helper,getShiftReport);
router.get("/shift/:shiftId/pdf",protect,downloadShiftReport);

export default router;