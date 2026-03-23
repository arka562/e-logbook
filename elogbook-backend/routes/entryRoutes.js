import express from "express";
import { helper } from "../middleware/authMiddleware.js";
import { createEntry } from "../controllers/entryController.js";
const router=express.Router();
router.post("/", helper, createEntry);
export default router;