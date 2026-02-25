import express from "express";
import { createShift,getShifts,getShiftById,closeShift,deleteShift } from "../controllers/shiftController.js";
import { helper, roleAuthorization } from "../middleware/authMiddleware.js";

const router = express.Router();

// Only operator / shift_incharge / admin can create shift
router.post(
  "/",
  helper,
  roleAuthorization("operator", "shift_incharge", "admin"),
  createShift
);
router.get(
  "/",
  helper,
  getShifts
);

router.get(
  "/:id",
  helper,
  getShiftById
);

router.patch(
  "/:id/close",
  helper,
  roleAuthorization("admin", "shift_incharge"),
  closeShift
);

router.delete(
  "/:id",
  helper,
  roleAuthorization("admin"),
  deleteShift
);
export default router;