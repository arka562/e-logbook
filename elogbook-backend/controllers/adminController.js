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

export const createDepartment = async (req, res) => {
  try {
    const { name, plantId } = req.body;

    if (!name || !plantId) {
      return res.status(400).json({
        message: "Department name and Plant ID are required"
      });
    }

    const department = await Department.create({
      name,
      plant: plantId
    });

    res.status(201).json(department);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createUnit = async (req, res) => {
  try {
    const { name, departmentId,plantId } = req.body;

    if (!name || !departmentId || !plantId) {
      return res.status(400).json({
        message: "Unit name and Department ID and PlantId  are required"
      });
    }

    const unit = await Unit.create({
      name,
      department: departmentId,
      plant:plantId
    });

    res.status(201).json(unit);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};