import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import testRoutes from "./routes/testRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import shiftRoutes from "./routes/shiftRoutes.js";
import parameterRoutes from "./routes/parameterRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import issueRoutes from "./routes/issueRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";
import auditRoutes from "./routes/auditRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import entryRoute from "./routes/entryRoutes.js"
import analyticsRoute from "./routes/analyticsRoute.js";
import mlRoutes from "./routes/mlRoute.js";

dotenv.config();

const app = express();

// Deployed behind a single proxy (typical PaaS): trust the first
// X-Forwarded-For hop so req.ip — used by audit logs and the rate
// limiters below — is the real client IP, not the proxy's.
app.set("trust proxy", 1);

// Middleware
// Security headers (X-Content-Type-Options, frame restrictions,
// HSTS, referrer policy, etc.). This service returns JSON/PDF only,
// so helmet's defaults are safe here.
app.use(helmet());
// CORS was previously cors() with no options, which reflects ANY origin.
// Restrict it to the frontend origin. Set CLIENT_URL in the environment
// for deployments; the fallback is the Vite dev server origin.
// The app authenticates with a Bearer token (not cookies), so
// credentials mode is not needed.
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());

// Rate limiting: a generous global cap per IP, and a strict cap on
// the auth routes to slow credential stuffing / brute force.
// Limits are per-IP in-memory counters (single-instance deployment);
// a multi-instance deployment would need a shared store such as Redis.
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === "/api/health",
  message: {
    success: false,
    message: "Too many requests, please try again later",
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication attempts, please try again later",
  },
});

app.use(globalLimiter);

// Health Route
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Adani Power Limited Backend Running"
  });
});
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/auth', authLimiter, testRoutes);
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
app.use(notFound);
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

// Start only after MongoDB is connected. Previously connectDB() was
// fired without await and app.listen ran immediately, so requests
// could arrive before (or without) a database connection.
// connectDB() itself exits the process if the connection fails.
const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
