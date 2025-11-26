import express from "express";
import {
  createBookController,
  deleteBookByIdController,
  getBookByIdController,
  listBooksController
} from "../controllers/bookController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import { authorizeRole } from "../middlewares/authorizeRole.js";

export const router = express.Router();

// Upload book only by admin
router.post(
  "/upload",
  authenticateToken,
  authorizeRole("admin"),
  createBookController
);

// Get list books with search and pagination
router.get("/", listBooksController);

// Book detail route
router.get("/:id", getBookByIdController);

// Delete book by ID only by admin
router.delete(
  "/:id",
  authenticateToken,
  authorizeRole("admin"),
  deleteBookByIdController
);

export default router;
