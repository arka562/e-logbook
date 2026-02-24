import mongoose from "mongoose";

const unitSchema=new mongoose.Schema({
  name:{
    type:String,
    required:true
  },
  plant:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Plant",
    required:true
  },
  department:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Department",
    required:true
  },
  capacity:{
    type:Number
  },
},{timestamps:true});

const Unit=mongoose.model("Unit",unitSchema);
export default Unit;