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

// Controller register user
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
      maxAge: 7 * 24 * 60 * 60 * 1000
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

// Controller login user
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

// Controller get user info by ID
export async function getUserController(req, res) {
  try {
    const { id } = req.params;
    const user = await getUserByIdService(id);
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
}

// Controller list all users
export async function getUsersController(req, res) {
  try {
    const users = await listUsersService();
    res.status(200).json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// Controller get user by email
export async function getUserByEmailController(req, res) {
  try {
    const { email } = req.params;
    const user = await getUserByEmailService(email);
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
}

// Controller refresh access token
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

// Controller logout user
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

// Controller logout from all devices
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

// Controller update user role
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
