import {
  addBookToFavorites,
  checkBookFavorited,
  getUserFavorites,
  removeBookFromFavorites
} from "../services/userFavoriteService.js";

/**
 * Controller: Add a book to the user's favorites
 */
export async function addFavoriteController(req, res, next) {
  try {
    const { bookId } = req.body;
    const userId = req.user.id;

    const favorite = await addBookToFavorites(userId, bookId);
    res.success(201, favorite);
  } catch (error) {
    next(error);
  }
}

/**
 * Controller: Remove a book from the user's favorites
 */
export async function removeFavoriteController(req, res, next) {
  try {
    const { id: bookId } = req.params;
    const userId = req.user.id;

    const result = await removeBookFromFavorites(userId, bookId);
    res.success(200, result);
  } catch (error) {
    next(error);
  }
}

/**
 * Controller: Get all favorites of the logged-in user
 */
export async function getFavoritesController(req, res, next) {
  try {
    const userId = req.user.id;
    const favorites = await getUserFavorites(userId);
    res.success(200, favorites);
  } catch (error) {
    next(error);
  }
}

/**
 * Controller: Check if a specific book is in the user's favorites
 */
export async function checkFavoriteController(req, res, next) {
  try {
    const { bookId } = req.params;
    const userId = req.user.id;

    const result = await checkBookFavorited(userId, bookId);
    res.success(200, result);
  } catch (error) {
    next(error);
  }
}
