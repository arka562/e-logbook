import express from "express";
import {
  createPlant,
  getPlants,
  deletePlant,
  getDepartmentsByPlant,
  getUnitsByDepartment,
  createDepartment,
  createUnit,
} from "../controllers/adminController.js";

import { helper, roleAuthorization } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/plant", helper, roleAuthorization("admin"), createPlant);
router.get("/plants",helper,getPlants);
router.delete("/plants/:id",helper,roleAuthorization("admin"),deletePlant);
router.post("/department", helper, roleAuthorization("admin"), createDepartment);
router.get("/plants/:plantId/departments",helper,getDepartmentsByPlant);
router.get("/departments/:departmentId/units",helper,getUnitsByDepartment);
router.post("/unit", helper, roleAuthorization("admin"), createUnit);

export default router;