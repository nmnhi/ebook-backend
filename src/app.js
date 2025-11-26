// src/app.js
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import bookRoutes from "./routes/book.routes.js";
import userRoutes from "./routes/user.routes.js";

const app = express();

// Basic middleware
app.use(express.json()); // Parse JSON request body
app.use(cors()); // Allow API calls from different domains
app.use(cookieParser());
app.use(helmet()); // Secure HTTP headers
app.use(morgan("dev")); // Log requests to console

// Simple test routes
app.use("/api/users", userRoutes);
app.use("/api/books", bookRoutes);

export default app;
