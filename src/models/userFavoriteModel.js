import pool from "../config/db.js";

/**
 * Check if a book is favorited by user
 * - Queries "user_favorites" for a specific user-book pair
 * - Returns true if record exists, false otherwise
 *
 * @param {string} userId - ID of the user
 * @param {string} bookId - ID of the book
 * @returns {boolean} Whether the book is favorited
 */
export async function isBookFavorited(userId, bookId) {
  const query = `
    SELECT 1 
    FROM user_favorites 
    WHERE user_id = $1 AND book_id = $2
    LIMIT 1;
  `;
  const values = [userId, bookId];
  const result = await pool.query(query, values);
  return result.rowCount > 0;
}

/**
 * Add book to user's favorites
 * - Checks if the book is already favorited by the user
 * - If not, inserts a new record into "user_favorites"
 * - Returns the newly created favorite record or null if already exists
 *
 * @param {string} userId - ID of the user
 * @param {string} bookId - ID of the book
 * @returns {object|null} Newly created favorite record or null if already favorited
 */
export async function addFavorite(userId, bookId) {
  // Check if already favorited
  const alreadyFavorited = await isBookFavorited(userId, bookId);
  if (alreadyFavorited) {
    return null; // Skip insert if already exists
  }

  const query = `
    INSERT INTO user_favorites (user_id, book_id)
    VALUES ($1, $2)
    RETURNING *;
  `;
  const values = [userId, bookId];
  const result = await pool.query(query, values);
  return result.rows[0];
}

/**
 * Remove book from user's favorites
 * - Deletes a record from "user_favorites"
 * - Returns number of rows deleted (0 if not found)
 *
 * @param {string} userId - ID of the user
 * @param {string} bookId - ID of the book
 * @returns {number} Number of rows deleted
 */
export async function removeFavorite(userId, bookId) {
  const query = `
    DELETE FROM user_favorites 
    WHERE user_id = $1 AND book_id = $2;
  `;
  const values = [userId, bookId];
  const result = await pool.query(query, values);
  return result.rowCount;
}

/**
 * Get all favorites of a user
 * - Joins "user_favorites" with "books" to return book details
 * - Includes timestamp when the book was added to favorites
 * - Orders results by added_at (newest first)
 *
 * @param {string} userId - ID of the user
 * @returns {array} List of favorite books with details
 */
export async function getFavoritesByUser(userId) {
  const query = `
    SELECT b.*, uf.created_at AS added_at
    FROM user_favorites uf
    JOIN books b ON uf.book_id = b.id
    WHERE uf.user_id = $1
    ORDER BY uf.created_at DESC;
  `;
  const values = [userId];
  const result = await pool.query(query, values);
  return result.rows;
}
