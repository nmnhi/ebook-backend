import jwt from "jsonwebtoken";
import {
  JWT_EXPIRES_IN,
  JWT_SECRET,
  REFRESH_EXPIRES_IN,
  REFRESH_SECRET
} from "../config/tokenConfig.js";

/**
 * Generate access token
 * - Creates a short-lived JWT for authentication
 * - Payload includes user id, email, and role
 * - Signed with JWT_SECRET
 * - Expires based on JWT_EXPIRES_IN (e.g., 15m, 1h)
 *
 * @param {object} user - User object containing id, email, role
 * @returns {string} JWT access token
 */
export function generateAccessToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * Verify access token
 * - Validates and decodes an access token
 * - Throws error if token is expired or invalid
 *
 * @param {string} token - JWT access token
 * @returns {object} Decoded payload if valid
 * @throws {Error} If token expired or invalid
 */
export function verifyAccessToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new Error("Access token expired");
    }
    throw new Error("Invalid access token");
  }
}

/**
 * Generate refresh token
 * - Creates a long-lived JWT for session persistence
 * - Payload includes user id, email, and role
 * - Signed with REFRESH_SECRET
 * - Expires based on REFRESH_EXPIRES_IN (e.g., 7d, 30d)
 *
 * @param {object} user - User object containing id, email, role
 * @returns {string} JWT refresh token
 */
export function generateRefreshToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    REFRESH_SECRET,
    { expiresIn: REFRESH_EXPIRES_IN }
  );
}

/**
 * Verify refresh token
 * - Validates and decodes a refresh token
 * - Throws error if token is expired or invalid
 *
 * @param {string} refreshToken - JWT refresh token
 * @returns {object} Decoded payload if valid
 * @throws {Error} If token expired or invalid
 */
export function verifyRefreshToken(refreshToken) {
  try {
    return jwt.verify(refreshToken, REFRESH_SECRET);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new Error("Refresh token expired");
    }
    throw new Error("Invalid refresh token");
  }
}
