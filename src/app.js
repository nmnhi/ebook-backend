// src/app.js
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import bookRoutes from "./routes/book.routes.js";
import userRoutes from "./routes/user.routes.js";

const app = express();

/**
 * Basic middleware setup
 */
app.use(express.json());
// Parse incoming JSON request bodies

app.use(cors());
// Enable Cross-Origin Resource Sharing (CORS) → allows API calls from different domains

app.use(cookieParser());
// Parse cookies from incoming requests (used for refresh tokens)

app.use(helmet());
// Secure HTTP headers → helps protect against common web vulnerabilities

app.use(morgan("dev"));
// HTTP request logger → logs requests to console in "dev" format

/**
 * API routes
 */
app.use("/api/users", userRoutes);
// User-related routes (authentication, profile, admin actions)

app.use("/api/books", bookRoutes);
// Book-related routes (CRUD, search, favorites)

/**
 * Export Express app
 */
export default app;
