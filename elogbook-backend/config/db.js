import mongoose from "mongoose"

const connectDB=async()=>{
  try{
     const conn=await mongoose.connect(process.env.MONGO_URI);
     console.log("Mongo Database Connected");
     console.log(`Mongo DB connected at ${conn.connection.host}`);
  }catch(error){
     console.log("Error found and connection failed");
     console.log("Error",error.message);
     process.exit(1);
  }
  };

mongoose.connection.on("disconnect",()=>{
  console.warn("Mongo DB disconnected");
}) 

mongoose.connection.on("reconnect",()=>{
  console.log("mongoDB reconnected");
})

export default connectDB;