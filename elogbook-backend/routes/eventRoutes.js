import express from "express";
import { createEvent } from "../controllers/eventController.js";
import { helper,roleAuthorization } from "../middleware/authMiddleware.js";

const route=express.Router();
route.post('/',helper,roleAuthorization("admin","operator","shift_incharge"),createEvent);

export default route; 