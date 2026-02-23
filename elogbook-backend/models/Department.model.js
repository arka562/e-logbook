import mongoose from "mongoose";

const departmentSchema=new mongoose.Schema({
  name:{
    type:String,
    required:true
  },
  plant:{
    type:mongoose.Schema.Types.Obj,
    ref:"Plant",
    required:true
  },
},{timestamps:true});

const Department=mongoose.model("Department",departmentSchema);

export default Department;