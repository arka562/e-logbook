import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import testRoutes from "./routes/testRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import shiftRoutes from "./routes/shiftRoutes.js";
import parameterRoutes from "./routes/parameterRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import issueRoutes from "./routes/issueRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import { errorHandler } from "./middleware/errorMiddleware.js";
import auditRoutes from "./routes/auditRoutes.js";

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health Route
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "E-Logbook Backend Running"
  });
});
app.use(errorHandler);
app.use('/api/auth/v1', authRoutes);
app.use('/api/auth/v2', testRoutes);
app.use("/api/admin/v1", adminRoutes);
app.use("/api/shifts/v1", shiftRoutes);
app.use("/api/parameters/v1", parameterRoutes);
app.use("/api/event/v1",eventRoutes);
app.use("/api/issues/v1", issueRoutes);
app.use("/api/dashboard/v1", dashboardRoutes);
app.use("/api/audit/v1", auditRoutes);
// MUST BE LAST
// app.use((err, req, res, next) => {
//   console.error("Server error:", err.stack);
//   res.status(500).json({
//     success: false,
//     message: "Internal Server Error"
//   });
// });

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});