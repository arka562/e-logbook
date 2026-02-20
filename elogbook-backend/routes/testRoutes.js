import express from "express";
import { helper,roleAuthorization } from "../middleware/authMiddleware.js";

const router=express.Router();
router.get('/protected',helper,(req,res)=>{
  res.json({
    message:"You are authorised",
    user:res.user,
  });
});

router.get('/admin',helper,roleAuthorization("admin"),(req,res)=>{
  res.json({
    message:"Authorised as a admin"
  })  
});

export default router;