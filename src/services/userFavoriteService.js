import {
  addFavorite,
  getFavoritesByUser,
  isBookFavorited,
  removeFavorite
} from "../models/userFavoriteModel.js";
import ApiError from "../utils/ApiError.js";

/**
 * Service: Add book to user's favorites
 */
export async function addBookToFavorites(userId, bookId) {
  const favorite = await addFavorite(userId, bookId);
  if (!favorite) throw new ApiError("Book already in favorites", 409);
  return favorite;
}

/**
 * Service: Remove book from user's favorites
 */
export async function removeBookFromFavorites(userId, bookId) {
  const deletedCount = await removeFavorite(userId, bookId);
  if (deletedCount === 0)
    throw new ApiError("Book not found in favorites", 404);
  return { deletedCount };
}

/**
 * Service: Get all favorites of a user
 */
export async function getUserFavorites(userId) {
  return await getFavoritesByUser(userId);
}

/**
 * Service: Check if a book is favorited by user
 */
export async function checkBookFavorited(userId, bookId) {
  const favorited = await isBookFavorited(userId, bookId);
  return { isFavorited: favorited };
}
