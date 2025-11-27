import {
  addFavorite,
  getFavoritesByUser,
  isBookFavorited,
  removeFavorite
} from "../models/userFavoriteModel.js";

/**
 * Service: Add book to user's favorites
 * - Calls model addFavorite
 * - Returns normalized response
 *
 * @param {string} userId - User ID
 * @param {string} bookId - Book ID
 * @returns {{success: boolean, data?: object, error?: string}}
 */
export async function addBookToFavorites(userId, bookId) {
  const favorite = await addFavorite(userId, bookId);
  if (!favorite) {
    return { success: false, error: "Book already in favorites" };
  }
  return { success: true, data: favorite };
}

/**
 * Service: Remove book from user's favorites
 * - Calls model removeFavorite
 * - Returns normalized response
 *
 * @param {string} userId - User ID
 * @param {string} bookId - Book ID
 * @returns {{success: boolean, data?: {deletedCount: number}, error?: string}}
 */
export async function removeBookFromFavorites(userId, bookId) {
  const deletedCount = await removeFavorite(userId, bookId);
  if (deletedCount === 0) {
    return { success: false, error: "Book not found in favorites" };
  }
  return { success: true, data: { deletedCount } };
}

/**
 * Service: Get all favorites of a user
 * - Calls model getFavoritesByUser
 *
 * @param {string} userId - User ID
 * @returns {{success: boolean, data?: object[], error?: string}}
 */
export async function getUserFavorites(userId) {
  const favorites = await getFavoritesByUser(userId);
  return { success: true, data: favorites };
}

/**
 * Service: Check if a book is favorited by user
 * - Calls model isBookFavorited
 *
 * @param {string} userId - User ID
 * @param {string} bookId - Book ID
 * @returns {{success: boolean, data?: {isFavorited: boolean}, error?: string}}
 */
export async function checkBookFavorited(userId, bookId) {
  const favorited = await isBookFavorited(userId, bookId);
  return { success: true, data: { isFavorited: favorited } };
}
