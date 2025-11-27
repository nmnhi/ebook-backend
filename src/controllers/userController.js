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
 * - Calls service to register user and generate tokens
 * - Sets refreshToken in secure HTTP-only cookie
 * - Returns 201 on success, 400 on failure
 */
export async function registerController(req, res) {
  try {
    const { name, email, password } = req.body;
    const result = await registerUserService({ name, email, password });

    if (!result.success) {
      return res.status(400).json(result);
    }

    const { refreshToken } = result.data;
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Controller: Login user
 * - Calls service to validate credentials and generate tokens
 * - Sets refreshToken in secure HTTP-only cookie
 * - Returns 200 on success, 400 on failure
 */
export async function loginController(req, res) {
  try {
    const { email, password } = req.body;
    const result = await loginUserService({ email, password });

    if (!result.success) {
      return res.status(400).json(result);
    }

    const { refreshToken } = result.data;
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Controller: Get user info by ID
 * - Returns 200 if found, 404 if not found
 */
export async function getUserController(req, res) {
  try {
    const { id } = req.params;
    const result = await getUserByIdService(id);

    if (!result.success) {
      return res.status(404).json(result);
    }
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Controller: List all users
 * - Returns 200 with list of users
 */
export async function getUsersController(req, res) {
  try {
    const result = await listUsersService();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Controller: Get user by email
 * - Returns 200 if found, 404 if not found
 */
export async function getUserByEmailController(req, res) {
  try {
    const { email } = req.params;
    const result = await getUserByEmailService(email);

    if (!result.success) {
      return res.status(404).json(result);
    }
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Controller: Refresh access token
 * - Returns 200 with new accessToken
 * - Returns 400 if missing, 401 if invalid
 */
export async function refreshTokenController(req, res) {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res
        .status(400)
        .json({ success: false, error: "Refresh token is missing" });
    }

    const result = await refreshAccessTokenService(refreshToken);
    if (!result.success) {
      return res.status(401).json(result);
    }
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Controller: Logout user (current device)
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
        error: "Refresh token and access token are required"
      });
    }

    const result = await logoutUserService(refreshToken, accessToken);
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.clearCookie("refreshToken");
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Controller: Logout user from all devices
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
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Controller: Update user role
 * - Validates role
 * - Returns 200 if updated, 400 if invalid
 */
export async function updateUserRoleController(req, res) {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!["user", "admin", "moderator"].includes(role)) {
      return res.status(400).json({ success: false, error: "Invalid role" });
    }

    const result = await updateUserRoleService(id, role);
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
