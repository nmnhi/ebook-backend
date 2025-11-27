import pool from "../config/db.js";

/**
 * Add token to blacklist
 * - Inserts a token into the blacklist_tokens table
 * - Uses ON CONFLICT DO NOTHING to avoid duplicates
 * - Returns the inserted row or null if token already existed
 *
 * @param {string} token - The JWT token to blacklist
 * @returns {object|null} The inserted row, or null if already exists
 */
export async function addTokenToBlacklist(token) {
  const result = await pool.query(
    `INSERT INTO blacklist_tokens (token)
     VALUES ($1)
     ON CONFLICT (token) DO NOTHING
     RETURNING *`,
    [token]
  );
  return result.rows[0] || null;
}

/**
 * Check if token is blacklisted
 * - Queries the blacklist_tokens table to see if a token exists
 *
 * @param {string} token - The JWT token to check
 * @returns {object|null} The row if token is found, otherwise null
 */
export async function findBlacklistedToken(token) {
  const result = await pool.query(
    `SELECT * FROM blacklist_tokens
     WHERE token = $1
     LIMIT 1`,
    [token]
  );
  return result.rows[0] || null;
}
