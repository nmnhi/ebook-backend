import {
  getUserByEmailService,
  getUserByIdService,
  listUsersService,
  loginUserService,
  logoutAllDevicesService,
  logoutUserService,
  refreshAccessTokenService,
  registerUserService,
  updateUserRoleService
} from "../services/userService.js";

/**
 * Controller: Register new user
 */
export async function registerController(req, res, next) {
  try {
    const { name, email, password } = req.body;
    const { user, accessToken, refreshToken } = await registerUserService({
      name,
      email,
      password
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.success(201, { user, accessToken });
  } catch (error) {
    next(error);
  }
}

/**
 * Controller: Login user
 */
export async function loginController(req, res, next) {
  try {
    const { email, password } = req.body;
    const { user, accessToken, refreshToken } = await loginUserService({
      email,
      password
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.success(200, { user, accessToken });
  } catch (error) {
    next(error);
  }
}

/**
 * Controller: Get user info by ID
 */
export async function getUserController(req, res, next) {
  try {
    const user = await getUserByIdService(req.params.id);
    res.success(200, user);
  } catch (error) {
    next(error);
  }
}

/**
 * Controller: List all users
 */
export async function getUsersController(req, res, next) {
  try {
    const users = await listUsersService();
    res.success(200, users);
  } catch (error) {
    next(error);
  }
}

/**
 * Controller: Get user by email
 */
export async function getUserByEmailController(req, res, next) {
  try {
    const user = await getUserByEmailService(req.params.email);
    res.success(200, user);
  } catch (error) {
    next(error);
  }
}

/**
 * Controller: Refresh access token
 */
export async function refreshTokenController(req, res, next) {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) throw new ApiError("Refresh token is missing", 400);

    const { accessToken } = await refreshAccessTokenService(refreshToken);
    res.success(200, { accessToken });
  } catch (error) {
    next(error);
  }
}

/**
 * Controller: Logout user (current device)
 */
export async function logoutController(req, res, next) {
  try {
    const accessToken = req.token;
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken || !accessToken)
      throw new ApiError("Refresh token and access token are required", 400);

    const result = await logoutUserService(refreshToken, accessToken);
    res.clearCookie("refreshToken");
    res.success(200, result);
  } catch (error) {
    next(error);
  }
}

/**
 * Controller: Logout user from all devices
 */
export async function logoutAllDevicesController(req, res, next) {
  try {
    const accessToken = req.token;
    const userId = req.user.id;
    const result = await logoutAllDevicesService(accessToken, userId);

    res.clearCookie("refreshToken");
    res.success(200, result);
  } catch (error) {
    next(error);
  }
}

/**
 * Controller: Update user role
 */
export async function updateUserRoleController(req, res, next) {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!["user", "admin", "moderator"].includes(role)) {
      throw new ApiError("Invalid role", 400);
    }

    const updatedUser = await updateUserRoleService(id, role);
    res.success(200, updatedUser);
  } catch (error) {
    next(error);
  }
}
