import pool from "../config/db.js";

// Save refresh token to database
export async function saveRefreshToken(userId, refreshToken) {
  const result = await pool.query(
    "INSERT INTO refresh_tokens (user_id, token) VALUES ($1, $2) RETURNING *",
    [userId, refreshToken]
  );
  return result.rows[0];
}

// Delete refresh token
export async function deleteRefreshToken(refreshToken) {
  const result = await pool.query(
    "DELETE FROM refresh_tokens WHERE token = $1",
    [refreshToken]
  );
  return result.rowCount;
}

// Check if refresh token exists
export async function findRefreshToken(refreshToken) {
  const result = await pool.query(
    "SELECT * FROM refresh_tokens WHERE token = $1",
    [refreshToken]
  );
  return result.rows[0];
}

// Delete all refresh tokens by user ID
export async function deleteAllRefreshTokensByUser(userId) {
  const result = await pool.query(
    "DELETE FROM refresh_tokens WHERE user_id = $1",
    [userId]
  );
  return result.rowCount;
}
