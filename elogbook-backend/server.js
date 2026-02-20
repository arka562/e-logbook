import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js"
import testRoutes from "./routes/testRoutes.js"

dotenv.config();
const app=express();
app.use(express.json());

connectDB();
app.use(cors());

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "E-Logbook Backend Running"
  });
});

app.use((err,req,res,next)=>{
  console.log("Server error",err.stack);

  res.status(500).json({
    success:false,
    message:"server error"
  })
}
)

app.use('/api/auth/v1',authRoutes);
app.use('/api/auth/v2',testRoutes);

const PORT=process.env.PORT || 5000;
app.listen(PORT,()=>{
  console.log(`Server connected at ${PORT}`);
});