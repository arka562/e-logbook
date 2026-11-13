import express from "express";
import {
  createPlant,
  getPlants,
  deletePlant,
  getDepartmentsByPlant,
  getUnitsByDepartment,
  createDepartment,
  createUnit,getUnits,getDepartments
} from "../controllers/adminController.js";

import { helper, roleAuthorization } from "../middleware/authMiddleware.js";
import asyncHandler from "../middleware/asyncHandler.js";

const router = express.Router();

// adminController handlers (except getDepartments) have no try/catch
// of their own, so every handler is wrapped: a rejected promise —
// e.g. a CastError from a malformed :id — previously crashed the
// whole server process instead of producing an error response.
router.post("/plant", helper, roleAuthorization("admin"), asyncHandler(createPlant));
router.get("/plants",helper,asyncHandler(getPlants));
router.delete("/plants/:id",helper,roleAuthorization("admin"),asyncHandler(deletePlant));
router.post("/department", helper, roleAuthorization("admin"), asyncHandler(createDepartment));
router.get("/departments", helper, asyncHandler(getDepartments));
router.get("/plants/:plantId/departments",helper,asyncHandler(getDepartmentsByPlant));
router.get("/departments/:departmentId/units",helper,asyncHandler(getUnitsByDepartment));
router.post("/unit", helper, roleAuthorization("admin"), asyncHandler(createUnit));
router.get("/units",helper,asyncHandler(getUnits));

export default router;