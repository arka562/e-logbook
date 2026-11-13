import express from "express";
import { registerUser,loginUser } from "../controllers/authController.js";
import asyncHandler from "../middleware/asyncHandler.js";

const route=express.Router();
// authController handlers have no try/catch of their own. Wrapping
// them forwards async rejections to the central error handler —
// unwrapped, a rejected promise crashes the process (Express 4 does
// not forward async errors by itself).
route.post('/register', asyncHandler(registerUser));
route.post('/login', asyncHandler(loginUser));

export default route;