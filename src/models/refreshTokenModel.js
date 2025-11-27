import pool from "../config/db.js";

/**
 * Save refresh token to database
 * - Inserts a new refresh token record into the "refresh_tokens" table
 * - Used when a user logs in or registers
 *
 * @param {string} userId - The ID of the user
 * @param {string} refreshToken - The refresh token to store
 * @returns {object} The inserted row containing user_id and token
 */
export async function saveRefreshToken(userId, refreshToken) {
  const result = await pool.query(
    "INSERT INTO refresh_tokens (user_id, token) VALUES ($1, $2) RETURNING *",
    [userId, refreshToken]
  );
  return result.rows[0];
}

/**
 * Delete refresh token
 * - Removes a specific refresh token from the "refresh_tokens" table
 * - Used when a user logs out from one device
 *
 * @param {string} refreshToken - The refresh token to delete
 * @returns {number} Number of rows deleted (0 if not found)
 */
export async function deleteRefreshToken(refreshToken) {
  const result = await pool.query(
    "DELETE FROM refresh_tokens WHERE token = $1",
    [refreshToken]
  );
  return result.rowCount;
}

/**
 * Check if refresh token exists
 * - Queries the "refresh_tokens" table to verify if a token is valid
 * - Used when refreshing access tokens
 *
 * @param {string} refreshToken - The refresh token to check
 * @returns {object|null} The token record if found, otherwise null
 */
export async function findRefreshToken(refreshToken) {
  const result = await pool.query(
    "SELECT * FROM refresh_tokens WHERE token = $1 LIMIT 1",
    [refreshToken]
  );
  return result.rows[0];
}

/**
 * Delete all refresh tokens by user ID
 * - Removes all refresh tokens associated with a specific user
 * - Used when logging out from all devices
 *
 * @param {string} userId - The ID of the user
 * @returns {number} Number of rows deleted
 */
export async function deleteAllRefreshTokensByUser(userId) {
  const result = await pool.query(
    "DELETE FROM refresh_tokens WHERE user_id = $1",
    [userId]
  );
  return result.rowCount;
}
