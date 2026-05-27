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
import reportRoutes from "./routes/reportRoutes.js";
import entryRoute from "./routes/entryRoutes.js"
import analyticsRoute from "./routes/analyticsRoute.js";
import mlRoutes from "./routes/mlRoute.js";

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
    message: "Adani Power Limited Backend Running"
  });
});
app.use('/api/auth', authRoutes);
app.use('/api/auth', testRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/shifts", shiftRoutes);
app.use("/api/parameters", parameterRoutes);
app.use("/api/event",eventRoutes);
app.use("/api/events",eventRoutes);
app.use("/api/issues", issueRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/audit", auditRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/entries",entryRoute);
app.use("/api/analytics", analyticsRoute);
app.use("/api/ml", mlRoutes);
app.use(errorHandler);
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
