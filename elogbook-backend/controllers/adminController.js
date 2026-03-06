import Plant from "../models/Plant.model.js";
import Unit from "../models/Unit.model.js";
import Department from "../models/Department.model.js";

export const createPlant=async (req,res)=>{
  
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
 
}
export const getPlants = async (req, res) => {
    const plants = await Plant.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: plants.length,
      data: plants
    });
  
};

export const deletePlant = async (req, res) => {
    const plantId = req.params.id;

    const departmentExists = await Department.findOne({ plant: plantId });

    if (departmentExists) {
      return res.status(400).json({
        message: "Cannot delete plant. Departments exist under it."
      });
    }

    await Plant.findByIdAndDelete(plantId);

    res.status(200).json({
      success: true,
      message: "Plant deleted successfully"
    });

};

export const createDepartment = async (req, res) => {
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
};
export const getDepartmentsByPlant = async (req, res) => {

    const { plantId } = req.params;

    const departments = await Department.find({ plant: plantId });

    res.status(200).json({
      success: true,
      count: departments.length,
      data: departments
    });
};

export const createUnit = async (req, res) => {
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

};

export const getUnitsByDepartment = async (req, res) => {
    const { departmentId } = req.params;

    const units = await Unit.find({ department: departmentId });

    res.status(200).json({
      success: true,
      count: units.length,
      data: units
    });
};