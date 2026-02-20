import express from "express";
import { registerUser,loginUser } from "../controllers/authController.js";

const route=express.Router();
route.post('/rgister',registerUser);
route.post('/login',loginUser);

export default route;