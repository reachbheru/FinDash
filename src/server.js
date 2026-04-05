import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
// import authRoutes from "./user/user.controller.js";
import userRoutes from "./user/user.router.js";
import adminRoutes from "./admin/admin.router.js";
import transactionRoutes from "./transaction/transaction.router.js";
import dashboardRoutes from "./dashboard/dashboard.router.js";
import errorHandler from "./middlewares/errorHandler.js";
import logger from "./common/logger.js";
import requestLogger from "./middlewares/requestLogger.js";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./common/swagger.js";

const app = express();
dotenv.config("././.env");
const PORT = process.env.PORT || 5000;
//
// ---------------- DATABASE CONNECTION ----------------
//
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    logger.dbConnected("MongoDB Atlas");
  } catch (error) {
    logger.dbConnectionFailed(error.message);
    process.exit(1);
  }
};

//
// ---------------- SECURITY MIDDLEWARE ----------------
//
app.use(helmet());

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    credentials: true,
  }),
);

//
// ---------------- RATE LIMITER ----------------
//
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 100,
  message: {
    success: false,
    message: "Too many requests, please try again later",
  },
});

app.use("/api", limiter);

//
// ---------------- COMMON MIDDLEWARE ----------------
//
app.use(morgan("combined"));
app.use(requestLogger);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//
// ---------------- HEALTH CHECK ----------------
//
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
  });
});

//
// ---------------- SWAGGER DOCUMENTATION ----------------
//
app.use(
  "/api/v1/docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    swaggerOptions: {
      persistAuthorization: true,
      displayOperationId: true,
      withCredentials: true,
    },
  }),
);

//
// ---------------- ROUTES ----------------
//
// app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/transactions", transactionRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);

//
// ---------------- 404 HANDLER ----------------
//
// app.use((req, res) => {
//   res.status(404).json({
//     success: false,
//     message: "Route not found",
//   });
// });

//
// ---------------- GLOBAL ERROR HANDLER ----------------
//
app.use(errorHandler);

//
// ---------------- SERVER START ----------------
//
const startServer = async () => {
  await connectDB();

  const server = app.listen(PORT, () => {
    logger.projectStart(PORT, process.env.NODE_ENV || "development");
  });

  //
  // Graceful shutdown
  //
  process.on("SIGINT", async () => {
    logger.projectStop();
    await mongoose.connection.close();
    logger.dbDisconnected();
    server.close(() => {
      logger.success("Server closed successfully");
      process.exit(0);
    });
  });
};

startServer();
