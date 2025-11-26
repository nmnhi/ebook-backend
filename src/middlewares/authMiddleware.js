import { findBlacklistedToken } from "../models/blacklistModel.js";
import { verifyAccessToken } from "../utils/tokenUtil.js";

export async function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Extract token from "Bearer <token>"

  if (!token) {
    return res.status(401).json({ success: false, message: "Token required" });
  }

  // Check if token is blacklisted
  const blacklistedToken = await findBlacklistedToken(token);
  if (blacklistedToken) {
    return res
      .status(403)
      .json({ success: false, message: "Token has been revoked" });
  }

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded; // Attach decoded user information to request
    req.token = token; // Attach token to request
    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: err.message });
  }
}
