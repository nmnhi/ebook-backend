import pool from "../config/db.js";

// Add token to blacklist
export async function addTokenToBlacklist(token) {
  const result = await pool.query(
    "INSERT INTO blacklist_tokens (token) VALUES ($1)",
    [token]
  );
  return result.rows[0];
}

// Check if token is blacklisted
export async function findBlacklistedToken(token) {
  const result = await pool.query(
    "SELECT * FROM blacklist_tokens WHERE token = $1",
    [token]
  );
  return result.rows[0];
}
