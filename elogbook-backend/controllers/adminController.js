import Plant from "../models/Plant.model.js";
import Unit from "../models/Unit.model.js";
import Department from "../models/Department.model.js";

export const createPlant=async (req,res)=>{
  try{
    const{name,location}=req.body;
    if(!name || !location){
      return res.status(400).json({messgae:"All fiels are required"});
    }
    const plantPresent=await Plant.findOne({name});
    if(plantPresent){
      return res.status(401).json({message:"This plant already exist"});
    }
    const plant=await Plant.create({
      name,
      location
    });
    res.status(201).json({message:plant});
  }catch(err){
    return res.status(500).json({message:err.message});
  }
}