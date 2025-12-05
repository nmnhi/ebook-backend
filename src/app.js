// src/app.js
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import errorHandler from "./middlewares/errorHandler.js";
import responseMiddleware from "./middlewares/response.js";
import bookRoutes from "./routes/book.routes.js";
import userRoutes from "./routes/user.routes.js";
import userFavoriteRoutes from "./routes/userFavoriteRoutes.routes.js";

const app = express();

/**
 * Basic middleware setup
 */
app.use(express.json());

// CORS configuration
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"], // Allow Vite dev servers
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

app.use(cookieParser());

// Configure helmet to allow PDF loading
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false
  })
);

app.use(morgan("dev"));

/**
 * Custom response helpers
 */
app.use(responseMiddleware);

/**
 * API routes
 */
app.use("/api/users", userRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/favorites", userFavoriteRoutes);

/**
 * Global error handler (must be last)
 */
app.use(errorHandler);

/**
 * Export Express app
 */
export default app;
