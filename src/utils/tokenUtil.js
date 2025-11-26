import jwt from "jsonwebtoken";
import {
  JWT_EXPIRES_IN,
  JWT_SECRET,
  REFRESH_EXPIRES_IN,
  REFRESH_SECRET
} from "../config/tokenConfig.js";

// Generate access token
export function generateAccessToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// Verify access token
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

// Generate refresh token
export function generateRefreshToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    REFRESH_SECRET,
    { expiresIn: REFRESH_EXPIRES_IN }
  );
}

// Verify refresh token
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
