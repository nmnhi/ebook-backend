export const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";
export const REFRESH_SECRET =
  process.env.REFRESH_SECRET || "refreshsupersecretkey";
export const REFRESH_EXPIRES_IN = process.env.REFRESH_EXPIRES_IN || "7d";
