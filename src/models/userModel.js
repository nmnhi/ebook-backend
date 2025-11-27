import pool from "../config/db.js";

/**
 * Create new user
 * - Inserts a new user record into the "users" table
 * - Default role is "user" unless specified
 * - Returns basic user info (excluding password)
 *
 * @param {object} userData - User details (name, email, password, role)
 * @returns {object} Newly created user record
 */
export async function createUser({ name, email, password, role = "user" }) {
  const query = `INSERT INTO users (name, email, password, role)
    VALUES ($1, $2, $3, $4) 
    RETURNING id, name, email, role, is_premium, created_at, updated_at`;
  const values = [name, email, password, role];
  const result = await pool.query(query, values);
  return result.rows[0];
}

/**
 * Get user by email
 * - Fetches a user record from the "users" table using email
 * - Used for login and registration checks
 *
 * @param {string} email - User's email address
 * @returns {object|null} User record if found, otherwise null
 */
export async function getUserByEmail(email) {
  const query = `SELECT * FROM users WHERE email = $1 LIMIT 1;`;
  const values = [email];
  const result = await pool.query(query, values);
  return result.rows[0];
}

/**
 * Get user by ID
 * - Fetches a user record from the "users" table using ID
 * - Returns limited fields (excluding password)
 *
 * @param {string} id - User ID
 * @returns {object|null} User record if found, otherwise null
 */
export async function findUserById(id) {
  const query = `SELECT id, name, email, role, is_premium, created_at, updated_at FROM users WHERE id = $1;`;
  const values = [id];
  const result = await pool.query(query, values);
  return result.rows[0];
}

/**
 * Get all users
 * - Fetches all user records from the "users" table
 * - Returns limited fields (excluding password)
 *
 * @returns {array} List of all users
 */
export async function getAllUsers() {
  const query = `SELECT id, name, email, role, is_premium, created_at, updated_at FROM users;`;
  const result = await pool.query(query);
  return result.rows;
}

/**
 * Update role of user by ID
 * - Updates the role of a specific user
 * - Returns updated user record
 *
 * @param {string} id - User ID
 * @param {string} role - New role (e.g., "user", "admin", "moderator")
 * @returns {object|null} Updated user record if successful, otherwise null
 */
export async function updateUserRole(id, role) {
  const query = `
    UPDATE users 
    SET role = $1, updated_at = CURRENT_TIMESTAMP 
    WHERE id = $2 
    RETURNING id, name, email, role, is_premium, created_at, updated_at;
  `;
  const values = [role, id];
  const result = await pool.query(query, values);
  return result.rows[0];
}
