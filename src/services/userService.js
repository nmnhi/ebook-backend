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
 * - Validates email uniqueness
 * - Hashes password
 * - Creates new user record
 * - Generates access & refresh tokens
 * - Saves refresh token in DB
 * - Returns safe user object and tokens
 */
export async function registerUserService({ name, email, password }) {
  const existingUser = await getUserByEmail(email);
  if (existingUser) return { success: false, error: "Email already in use" };

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await createUser({ name, email, password: hashedPassword });

  const accessToken = generateAccessToken(newUser);
  const refreshToken = generateRefreshToken(newUser);
  await saveRefreshToken(newUser.id, refreshToken);

  const { password: _, ...safeUser } = newUser;
  return { success: true, data: { user: safeUser, accessToken, refreshToken } };
}

/**
 * Service: Login user
 * - Validates email & password
 * - Generates tokens
 * - Saves refresh token
 * - Returns safe user object and tokens
 */
export async function loginUserService({ email, password }) {
  const user = await getUserByEmail(email);
  if (!user) return { success: false, error: "Invalid email or password" };

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return { success: false, error: "Invalid email or password" };

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  await saveRefreshToken(user.id, refreshToken);

  const { password: _, ...safeUser } = user;
  return { success: true, data: { user: safeUser, accessToken, refreshToken } };
}

/**
 * Service: Get user by ID
 */
export async function getUserByIdService(id) {
  const user = await findUserById(id);
  if (!user) return { success: false, error: "User not found" };
  return { success: true, data: user };
}

/**
 * Service: Get user by email
 */
export async function getUserByEmailService(email) {
  const user = await getUserByEmail(email);
  if (!user) return { success: false, error: "User not found" };
  return { success: true, data: user };
}

/**
 * Service: Get all users
 */
export async function listUsersService() {
  const users = await getAllUsers();
  return { success: true, data: users };
}

/**
 * Service: Refresh access token
 */
export async function refreshAccessTokenService(refreshToken) {
  const stored = await findRefreshToken(refreshToken);
  if (!stored) return { success: false, error: "Refresh token not found" };

  try {
    const decoded = verifyRefreshToken(refreshToken);
    const user = await findUserById(decoded.id);
    if (!user) return { success: false, error: "User not found" };

    const accessToken = generateAccessToken(user);
    return { success: true, data: { accessToken } };
  } catch {
    return { success: false, error: "Invalid or expired refresh token" };
  }
}

/**
 * Service: Logout user (current device)
 */
export async function logoutUserService(refreshToken, accessToken) {
  const deleted = await deleteRefreshToken(refreshToken);
  if (deleted === 0)
    return { success: false, error: "Refresh token not found" };

  const result = await addTokenToBlacklist(accessToken);
  if (!result)
    return { success: false, error: "Failed to blacklist access token" };

  return { success: true, data: { message: "Logged out successfully" } };
}

/**
 * Service: Logout user from all devices
 */
export async function logoutAllDevicesService(accessToken, userId) {
  const deleted = await deleteAllRefreshTokensByUser(userId);
  await addTokenToBlacklist(accessToken);
  return {
    success: true,
    data: { message: `Logged out from ${deleted} devices` }
  };
}

/**
 * Service: Update user role
 */
export async function updateUserRoleService(id, role) {
  const user = await findUserById(id);
  if (!user) return { success: false, error: "User not found" };

  const updatedUser = await updateUserRole(id, role);
  if (!updatedUser)
    return { success: false, error: "Failed to update user role" };

  return { success: true, data: updatedUser };
}
