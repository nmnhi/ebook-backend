/**
 * Token configuration
 * - Provides secrets and expiration times for JWT access & refresh tokens
 * - Values are loaded from environment variables (.env)
 * - Fallback defaults are provided for development/testing
 */

// Secret key for signing access tokens
export const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// Expiration time for access tokens (e.g., "1h" = 1 hour)
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";

// Secret key for signing refresh tokens
export const REFRESH_SECRET =
  process.env.REFRESH_SECRET || "refreshsupersecretkey";

// Expiration time for refresh tokens (e.g., "7d" = 7 days)
export const REFRESH_EXPIRES_IN = process.env.REFRESH_EXPIRES_IN || "7d";
