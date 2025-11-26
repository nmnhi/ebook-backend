import pool from "../config/db.js";

// Method register new user
export async function createUser({ name, email, password, role = "user" }) {
  const query = `INSERT INTO users (name, email, password, role)
	VALUES ($1, $2, $3, $4) 
	RETURNING id, name, email, role, is_premium, created_at`;
  const values = [name, email, password, role];
  const result = await pool.query(query, values);
  return result.rows[0];
}

// Method get user by email
export async function getUserByEmail(email) {
  const query = `SELECT * FROM users WHERE email = $1;`;
  const values = [email];
  const result = await pool.query(query, values);
  return result.rows[0];
}

// Method get user by ID
export async function findUserById(id) {
  const query = `SELECT id, name, email, role, is_premium, created_at FROM users WHERE id = $1;`;
  const values = [id];
  const result = await pool.query(query, values);
  return result.rows[0];
}

//  Method get all users
export async function getAllUsers() {
  const query = `SELECT id, name, email, role, is_premium, created_at FROM users;`;
  const result = await pool.query(query);
  return result.rows;
}

// Update role of user by ID
export async function updateUserRole(id, role) {
  const query = `UPDATE users SET role = $1 WHERE id = $2 RETURNING id, name, email, role, is_premium, created_at;`;
  const values = [role, id];
  const result = await pool.query(query, values);
  return result.rows[0];
}
