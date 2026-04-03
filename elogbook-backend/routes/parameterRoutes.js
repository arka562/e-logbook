import express from "express";
import {
  createParameterTemplate,
  getTemplatesByCategory
} from "../controllers/parameterController.js";

import { helper, roleAuthorization } from "../middleware/authMiddleware.js";

const router = express.Router();

// CREATE
router.post(
  "/templates",
  helper,
  roleAuthorization("admin"),
  createParameterTemplate
);

// GET
router.get(
  "/templates",
  helper,
  getTemplatesByCategory
);

export default router;