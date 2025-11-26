import pool from "../config/db.js";

/**
 * Add token to blacklist
 * - Inserts a token into the blacklist_tokens table
 * - Used when a user logs out or a token is revoked
 *
 * @param {string} token - The JWT token to blacklist
 * @returns {object} The inserted row (may be undefined depending on query result)
 */
export async function addTokenToBlacklist(token) {
  const result = await pool.query(
    "INSERT INTO blacklist_tokens (token) VALUES ($1)",
    [token]
  );
  return result.rows[0];
}

/**
 * Check if token is blacklisted
 * - Queries the blacklist_tokens table to see if a token exists
 * - Used to prevent usage of revoked tokens
 *
 * @param {string} token - The JWT token to check
 * @returns {object|null} The row if token is found, otherwise null
 */
export async function findBlacklistedToken(token) {
  const result = await pool.query(
    "SELECT * FROM blacklist_tokens WHERE token = $1",
    [token]
  );
  return result.rows[0];
}
