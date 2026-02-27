import express from "express";
import { createEvent } from "../controllers/eventController";
import { helper,roleAuthorization } from "../middleware/authMiddleware";

const route=express.Router();
route.post('/create',helper,roleAuthorization("admin"),createEvent);

export default route; 