import {
  addBookToFavorites,
  checkBookFavorited,
  getUserFavorites,
  removeBookFromFavorites
} from "../services/userFavoriteService.js";

/**
 * Controller: Add a book to the user's favorites
 * - Requires a valid JWT (userId from req.user.id)
 * - Expects bookId in request body
 * - 201 Created on success, 409 Conflict if already exists
 */
export async function addFavoriteController(req, res) {
  try {
    const { bookId } = req.body;
    const userId = req.user.id;

    const result = await addBookToFavorites(userId, bookId);
    if (!result.success) {
      return res.status(409).json(result);
    }
    return res.status(201).json(result);
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Controller: Remove a book from the user's favorites
 * - Requires a valid JWT (userId from req.user.id)
 * - Expects bookId in request params
 * - 200 OK on success, 404 Not Found if not in favorites
 */
export async function removeFavoriteController(req, res) {
  try {
    const { id: bookId } = req.params;
    const userId = req.user.id;

    const result = await removeBookFromFavorites(userId, bookId);
    if (!result.success) {
      return res.status(404).json(result);
    }
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Controller: Get all favorites of the logged-in user
 * - Requires a valid JWT (userId from req.user.id)
 * - Returns list of books with details and added_at timestamp
 */
export async function getFavoritesController(req, res) {
  try {
    const userId = req.user.id;
    const result = await getUserFavorites(userId);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Controller: Check if a specific book is in the user's favorites
 * - Requires a valid JWT (userId from req.user.id)
 * - Expects bookId in request params
 * - Returns true/false in data field
 */
export async function checkFavoriteController(req, res) {
  try {
    const { bookId } = req.params;
    const userId = req.user.id;

    const result = await checkBookFavorited(userId, bookId);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
