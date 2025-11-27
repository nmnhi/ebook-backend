import express from "express";
import {
  createBookController,
  deleteBookByIdController,
  getBookByIdController,
  listBooksController
} from "../controllers/bookController.js";
import {
  authenticateToken,
  authenticateTokenOptional
} from "../middlewares/authMiddleware.js";
import { authorizeRole } from "../middlewares/authorizeRole.js";

const router = express.Router();

/**
 * Route: POST /upload
 * - Create (upload) a new book
 * - Protected: requires authentication and admin role
 */
router.post(
  "/upload",
  authenticateToken, // Verify JWT token
  authorizeRole("admin"), // Only allow admin users
  createBookController // Controller to handle book creation
);

/**
 * Route: GET /
 * - Get list of books with search, pagination, and sorting
 * - Public: no authentication required
 * - If user is logged in, favorites status will be included
 */
router.get("/", authenticateTokenOptional, listBooksController);

/**
 * Route: GET /:id
 * - Get book details by ID
 * - Optional authentication: if user is logged in, returns favorite status
 * - If not logged in, still returns book details
 */
router.get("/:id", authenticateTokenOptional, getBookByIdController);

/**
 * Route: DELETE /:id
 * - Delete a book by ID
 * - Protected: requires authentication and admin role
 */
router.delete(
  "/:id",
  authenticateToken, // Verify JWT token
  authorizeRole("admin"), // Only allow admin users
  deleteBookByIdController // Controller to handle book deletion
);

export default router;
