import express from "express";
import {
  createPlant,
  createDepartment,
  createUnit,
} from "../controllers/adminController.js";

import { helper, roleAuthorization } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/plant", helper, roleAuthorization("admin"), createPlant);
router.post("/department", helper, roleAuthorization("admin"), createDepartment);
router.post("/unit", helper, roleAuthorization("admin"), createUnit);

export default router;