import mongoose from "mongoose";

const plantSchema=new mongoose.Schema({
  name:{
    type:String,
    required:true,
    unique:true
  },
  location:{
    type:String,
  },
},{timestamps:true});

const Plant=mongoose.model("Plant",plantSchema);

export default Plant;