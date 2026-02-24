import express from "express";
import { createShift } from "../controllers/shiftController.js";
import { helper, roleAuthorization } from "../middleware/authMiddleware.js";

const router = express.Router();

// Only operator / shift_incharge / admin can create shift
router.post(
  "/",
  helper,
  roleAuthorization("operator", "shift_incharge", "admin"),
  createShift
);

export default router;