import { findBlacklistedToken } from "../models/blacklistModel.js";
import { verifyAccessToken } from "../utils/tokenUtil.js";

/**
 * Middleware: authenticateToken
 * - Requires a valid JWT token in the Authorization header
 * - Checks if the token is blacklisted (revoked)
 * - Verifies the token and attaches decoded user info to req.user
 * - Blocks request if token is missing, revoked, or invalid
 */
export async function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Extract token from "Bearer <token>"

  if (!token) {
    return res.status(401).json({ success: false, message: "Token required" });
  }

  // Check if token is blacklisted (revoked)
  const blacklistedToken = await findBlacklistedToken(token);
  if (blacklistedToken) {
    return res
      .status(403)
      .json({ success: false, message: "Token has been revoked" });
  }

  try {
    // Verify token and attach decoded user info
    const decoded = verifyAccessToken(token);
    req.user = decoded; // Attach decoded user information to request
    req.token = token; // Attach raw token to request
    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: err.message });
  }
}

/**
 * Middleware: authenticateTokenOptional
 * - Token is optional: request can proceed without it
 * - If token is provided:
 *   - Check blacklist
 *   - Verify token and attach decoded user info
 * - If token is missing or invalid:
 *   - Continue request with req.user = null
 */
export async function authenticateTokenOptional(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    // No token → treat as guest user
    req.user = null;
    req.token = null;
    return next();
  }

  // Check if token is blacklisted
  const blacklistedToken = await findBlacklistedToken(token);
  if (blacklistedToken) {
    // Token revoked → treat as guest user
    req.user = null;
    req.token = null;
    return next();
  }

  try {
    // Verify token and attach decoded user info
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    req.token = token;
    next();
  } catch (err) {
    // Invalid token → treat as guest user
    req.user = null;
    req.token = null;
    next();
  }
}
