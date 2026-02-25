import express from "express";
import {
  createParameterTemplate,
  getTemplatesByCategory,
} from "../controllers/parameterController.js";

import { helper,roleAuthorization } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
  "/template",
  helper,
  roleAuthorization("admin"),
  createParameterTemplate
);

router.get(
  "/templates",
  helper,
  getTemplatesByCategory
);

export default router;