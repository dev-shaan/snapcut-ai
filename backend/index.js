import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import uploadRoutes from "./routes/uploadRoutes.js";
import dbRoutes from "./routes/dbRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import creditRoutes from "./routes/creditRoutes.js";
import historyRoutes from "./routes/historyRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = "0.0.0.0";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

const isProduction = process.env.NODE_ENV === "production";
const allowedOrigins = isProduction
  ? [process.env.FRONTEND_URL].filter(Boolean)
  : [FRONTEND_URL, "http://localhost:5173", "http://localhost:3000"].filter(Boolean);

// Configure CORS cleanly for development and production
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS policy violation: Origin ${origin} not allowed.`));
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);


app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Register Routes
app.use("/api", uploadRoutes);
app.use("/api", dbRoutes);
app.use("/api", authRoutes);
app.use("/api", creditRoutes);
app.use("/api", historyRoutes);
app.use("/api", paymentRoutes);


// Health Check Route
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "SnapCut AI API server is running",
    timestamp: new Date().toISOString(),
  });
});

// Root API Endpoint
app.get("/", (req, res) => {
  res.status(200).json({
    name: "SnapCut AI API",
    version: "1.0.0",
    health: "/api/health",
  });
});

// Global Centralized Error Handler (prevents unhandled exceptions from leaking stack traces)
app.use((err, req, res, next) => {
  console.error("[Unhandled Express Error Log]", err);
  res.status(err.status || 500).json({
    success: false,
    error: "An unexpected internal server error occurred.",
  });
});

app.listen(PORT, HOST, () => {
  console.log(`[SnapCut AI Backend] Server running on http://${HOST}:${PORT}`);
});

