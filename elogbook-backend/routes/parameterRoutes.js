import express from "express";
import {
  createParameterTemplate,
  getTemplatesByCategory
} from "../controllers/parameterController.js";

import { helper, roleAuthorization } from "../middleware/authMiddleware.js";
import asyncHandler from "../middleware/asyncHandler.js";

const router = express.Router();

// CREATE
router.post(
  "/templates",
  helper,
  roleAuthorization("admin"),
  asyncHandler(createParameterTemplate)
);

// GET
router.get(
  "/templates",
  helper,
  asyncHandler(getTemplatesByCategory)
);

export default router;