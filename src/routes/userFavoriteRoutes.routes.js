import express from "express";
import {
  addFavoriteController,
  checkFavoriteController,
  getFavoritesController,
  removeFavoriteController
} from "../controllers/userFavoriteController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

/**
 * @route POST /favorites
 * @desc Add a book to the logged-in user's favorites
 * @body { bookId } - userId is taken from JWT token
 */
router.post("/", authenticateToken, addFavoriteController);

/**
 * @route DELETE /favorites
 * @desc Remove a book from the logged-in user's favorites
 * @body { bookId } - userId is taken from JWT token
 */
router.delete("/:id", authenticateToken, removeFavoriteController);

/**
 * @route GET /favorites
 * @desc Get all favorites of the logged-in user
 * @auth Requires JWT token
 */
router.get("/", authenticateToken, getFavoritesController);

/**
 * @route GET /favorites/:bookId
 * @desc Check if a specific book is in the logged-in user's favorites
 * @param { bookId } - userId is taken from JWT token
 */
router.get("/:bookId", authenticateToken, checkFavoriteController);

export default router;
