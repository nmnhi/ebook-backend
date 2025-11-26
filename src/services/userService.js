import bcrypt from "bcrypt";
import { addTokenToBlacklist } from "../models/blacklistModel.js";
import {
  deleteAllRefreshTokensByUser,
  deleteRefreshToken,
  findRefreshToken,
  saveRefreshToken
} from "../models/refreshTokenModel.js";
import {
  createUser,
  findUserById,
  getAllUsers,
  getUserByEmail,
  updateUserRole
} from "../models/userModel.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken
} from "../utils/tokenUtil.js";

/**
 * Service: Register user
 * - Checks if email already exists
 * - Hashes password using bcrypt
 * - Creates new user in database
 * - Generates access & refresh tokens
 * - Saves refresh token in DB
 * - Returns safe user object (without password) and tokens
 */
export async function registerUserService({ name, email, password }) {
  const existingUser = await getUserByEmail(email);
  if (existingUser) throw new Error("Email already in use");

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await createUser({ name, email, password: hashedPassword });

  const accessToken = generateAccessToken(newUser);
  const refreshToken = generateRefreshToken(newUser);
  await saveRefreshToken(newUser.id, refreshToken);

  const { password: _, ...safeUser } = newUser;
  return { user: safeUser, accessToken, refreshToken };
}

/**
 * Service: Login user
 * - Fetches user by email
 * - Validates password using bcrypt
 * - Generates access & refresh tokens
 * - Saves refresh token in DB
 * - Returns safe user object (without password) and tokens
 */
export async function loginUserService({ email, password }) {
  const user = await getUserByEmail(email);
  if (!user) throw new Error("Invalid email or password");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Invalid email or password");

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  await saveRefreshToken(user.id, refreshToken);

  const { password: _, ...safeUser } = user;
  return { user: safeUser, accessToken, refreshToken };
}

/**
 * Service: Get user by ID
 * - Fetches user record from DB by ID
 * - Throws error if not found
 */
export async function getUserByIdService(id) {
  const user = await findUserById(id);
  if (!user) throw new Error("User not found");
  return user;
}

/**
 * Service: Get user by email
 * - Fetches user record from DB by email
 * - Throws error if not found
 */
export async function getUserByEmailService(email) {
  const user = await getUserByEmail(email);
  if (!user) throw new Error("User not found");
  return user;
}

/**
 * Service: Get all users
 * - Fetches all user records from DB
 */
export async function listUsersService() {
  return await getAllUsers();
}

/**
 * Service: Refresh access token
 * - Validates refresh token exists in DB
 * - Verifies refresh token signature
 * - Fetches user by decoded ID
 * - Generates new access token
 */
export async function refreshAccessTokenService(refreshToken) {
  const stored = await findRefreshToken(refreshToken);
  if (!stored) throw new Error("Refresh token not found");

  try {
    const decoded = verifyRefreshToken(refreshToken);
    const user = await findUserById(decoded.id);
    if (!user) throw new Error("User not found");

    const accessToken = generateAccessToken(user);
    return { accessToken };
  } catch (err) {
    throw new Error("Invalid or expired refresh token");
  }
}

/**
 * Service: Logout user (current device)
 * - Deletes refresh token from DB
 * - Blacklists access token
 * - Returns success message
 */
export async function logoutUserService(refreshToken, accessToken) {
  const deleted = await deleteRefreshToken(refreshToken);
  if (deleted === 0) {
    throw new Error("Refresh token not found");
  }
  const result = await addTokenToBlacklist(accessToken);
  if (!result) {
    throw new Error("Failed to blacklist access token");
  }
  return { success: true, message: "Logged out successfully" };
}

/**
 * Service: Logout user from all devices
 * - Deletes all refresh tokens for user
 * - Blacklists current access token
 * - Returns success message with number of devices logged out
 */
export async function logoutAllDevicesService(accessToken, userId) {
  const deleted = await deleteAllRefreshTokensByUser(userId);
  await addTokenToBlacklist(accessToken);
  return {
    success: true,
    message: `Logged out from ${deleted} devices`
  };
}

/**
 * Service: Update user role
 * - Validates user exists
 * - Updates role in DB
 * - Returns updated user record
 */
export async function updateUserRoleService(id, role) {
  const user = await findUserById(id);
  if (!user) throw new Error("User not found");

  const updatedUser = await updateUserRole(id, role);
  if (!updatedUser) throw new Error("Failed to update user role");
  return updatedUser;
}
