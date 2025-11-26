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
 * - Extracts name, email, password from request body
 * - Calls service to create user and generate tokens
 * - Sets refreshToken in secure HTTP-only cookie
 * - Returns 201 with user info and accessToken
 */
export async function registerController(req, res) {
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
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(201).json({
      success: true,
      message: "Register user successfully",
      user,
      accessToken
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}

/**
 * Controller: Login user
 * - Extracts email and password from request body
 * - Calls service to validate credentials and generate tokens
 * - Sets refreshToken in secure HTTP-only cookie
 * - Returns 200 with user info and accessToken
 */
export async function loginController(req, res) {
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

    res.status(200).json({
      success: true,
      message: "Login successful",
      user,
      accessToken
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}

/**
 * Controller: Get user info by ID
 * - Extracts user ID from request params
 * - Calls service to fetch user details
 * - Returns 200 with user info if found
 * - Returns 404 if user not found
 */
export async function getUserController(req, res) {
  try {
    const { id } = req.params;
    const user = await getUserByIdService(id);
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
}

/**
 * Controller: List all users
 * - Calls service to fetch all users
 * - Returns 200 with list of users
 * - Returns 500 if an error occurs
 */
export async function getUsersController(req, res) {
  try {
    const users = await listUsersService();
    res.status(200).json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Controller: Get user by email
 * - Extracts email from request params
 * - Calls service to fetch user details
 * - Returns 200 with user info if found
 * - Returns 404 if user not found
 */
export async function getUserByEmailController(req, res) {
  try {
    const { email } = req.params;
    const user = await getUserByEmailService(email);
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
}

/**
 * Controller: Refresh access token
 * - Extracts refreshToken from cookies
 * - Calls service to generate new accessToken
 * - Returns 200 with new accessToken
 * - Returns 400 if refreshToken missing
 * - Returns 401 if refreshToken invalid
 */
export async function refreshTokenController(req, res) {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res
        .status(400)
        .json({ success: false, message: "Refresh token is missing" });
    }
    const { accessToken } = await refreshAccessTokenService(refreshToken);
    res.status(200).json({
      success: true,
      message: "Access token refreshed",
      accessToken
    });
  } catch (error) {
    res.status(401).json({ success: false, message: error.message });
  }
}

/**
 * Controller: Logout user (current device)
 * - Extracts accessToken from request and refreshToken from cookies
 * - Calls service to revoke tokens
 * - Clears refreshToken cookie
 * - Returns 200 if logout successful
 */
export async function logoutController(req, res) {
  try {
    const accessToken = req.token;
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken || !accessToken) {
      return res.status(400).json({
        success: false,
        message: "Refresh token and access token are required"
      });
    }

    const result = await logoutUserService(refreshToken, accessToken);

    res.clearCookie("refreshToken");
    res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Controller: Logout user from all devices
 * - Extracts accessToken and userId from request
 * - Calls service to revoke all tokens for user
 * - Clears refreshToken cookie
 * - Returns 200 if logout successful
 */
export async function logoutAllDevicesController(req, res) {
  try {
    const accessToken = req.token;
    const userId = req.user.id;

    const result = await logoutAllDevicesService(accessToken, userId);
    res.clearCookie("refreshToken");
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Controller: Update user role
 * - Extracts user ID from params and role from body
 * - Validates role (must be user, admin, or moderator)
 * - Calls service to update user role
 * - Returns 200 with updated user info if successful
 * - Returns 400 if role invalid or update fails
 */
export async function updateUserRoleController(req, res) {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!["user", "admin", "moderator"].includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role" });
    }

    const updatedUser = await updateUserRoleService(id, role);
    res
      .status(200)
      .json({ success: true, message: "User role updated", user: updatedUser });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}
