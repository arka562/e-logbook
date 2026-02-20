import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import User from "../models/User.model.js";

export const helper=async (req,res,next)=>{
  let token;
  if(req.headers.authorization){
    if(req.headers.authorization.startsWith("Bearer")){
      try{
        token=req.headers.authorization.split("")[1];
        const decoded=jwt.verify(token,JWT_SECRET);
        req.user=await User.findById(decoded.id).select("-password");
        next();
      }catch(err){
        res.status(401).json({message:"Not Authorized.Token Failed"});
      }
    }else{
      return res.status(400).json({message:"Defected Token"});
    }
  if(!token){
    return res.status(400).json({message:"No token provided"});
  }
  }

}

export const roleAuthorization=(...roles)=>{
  return (req,res,next)=>{
    if(!roles.includes(req.user.role)){
      return res.status(403).json({message:`Role ${req.user.role} not authozide for it`})
    }
  
  next();
}
}
