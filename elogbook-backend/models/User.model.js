import mongoose from "mongoose";
import bycrypt from "bcryptjs";

const userSchema=new mongoose.Schema({
  name:{
    type:String,
    required:true
  },
  email:{
    type:String,
    required:true,
    unique:true
  },
  password:{
    type:String,
    required:true,
    minlength:6
  },
  role:{
    type:String,
    enum:["operator","shift_incharge","hod","admin"],
    default:"operator"
  },
  department:{
    type:String,
    required:true
  },
},{timestamps:true});

userSchema.pre("save",async function(next){
  if(!this.isModified("password")) return next();

  const salt=await bycrypt.salt(10);
  this.password=await bycrypt.hash(this.password,salt);
  next();
});

userSchema.methods.matchPassword=async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword,this.password);
  
};
const User=mongoose.model("User",userSchema);
export default User;


