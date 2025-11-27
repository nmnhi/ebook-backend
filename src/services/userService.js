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
  if (existingUser) throw new ApiError("Email already in use", 400);

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
 * - Validates email & password
 * - Generates tokens
 * - Saves refresh token
 * - Returns safe user object and tokens
 */
export async function loginUserService({ email, password }) {
  const user = await getUserByEmail(email);
  if (!user) throw new ApiError("Invalid email or password", 400);

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new ApiError("Invalid email or password", 400);

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  await saveRefreshToken(user.id, refreshToken);

  const { password: _, ...safeUser } = user;
  return { user: safeUser, accessToken, refreshToken };
}

/**
 * Service: Get user by ID
 */
export async function getUserByIdService(id) {
  const user = await findUserById(id);
  if (!user) throw new ApiError("User not found", 404);
  return user;
}

/**
 * Service: Get user by email
 */
export async function getUserByEmailService(email) {
  const user = await getUserByEmail(email);
  if (!user) throw new ApiError("User not found", 404);
  return user;
}

/**
 * Service: Get all users
 */
export async function listUsersService() {
  return await getAllUsers();
}

/**
 * Service: Refresh access token
 */
export async function refreshAccessTokenService(refreshToken) {
  const stored = await findRefreshToken(refreshToken);
  if (!stored) throw new ApiError("Refresh token not found", 400);

  try {
    const decoded = verifyRefreshToken(refreshToken);
    const user = await findUserById(decoded.id);
    if (!user) throw new ApiError("User not found", 404);

    const accessToken = generateAccessToken(user);
    return { accessToken };
  } catch {
    throw new ApiError("Invalid or expired refresh token", 401);
  }
}

/**
 * Service: Logout user (current device)
 */
export async function logoutUserService(refreshToken, accessToken) {
  const deleted = await deleteRefreshToken(refreshToken);
  if (deleted === 0) throw new ApiError("Refresh token not found", 400);

  const result = await addTokenToBlacklist(accessToken);
  if (!result) throw new ApiError("Failed to blacklist access token", 500);

  return { message: "Logged out successfully" };
}

/**
 * Service: Logout user from all devices
 */
export async function logoutAllDevicesService(accessToken, userId) {
  const deleted = await deleteAllRefreshTokensByUser(userId);
  await addTokenToBlacklist(accessToken);
  return { message: `Logged out from ${deleted} devices` };
}

/**
 * Service: Update user role
 */
export async function updateUserRoleService(id, role) {
  const user = await findUserById(id);
  if (!user) throw new ApiError("User not found", 404);

  const updatedUser = await updateUserRole(id, role);
  if (!updatedUser) throw new ApiError("Failed to update user role", 400);

  return updatedUser;
}
