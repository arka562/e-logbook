import express from "express";
import { getShiftReport,downloadShiftReport } from "../controllers/reportController.js";
import { helper,roleAuthorization } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/shift/:shiftId",helper,roleAuthorization("admin","shift_incharge","hod","operator"),getShiftReport);
router.get("/shift/:shiftId/pdf",helper,roleAuthorization("admin","shift_incharge","hod"),downloadShiftReport);

export default router;