import express from "express";
import {
  getUserByEmailController,
  getUserController,
  getUsersController,
  loginController,
  logoutAllDevicesController,
  logoutController,
  refreshTokenController,
  registerController,
  updateUserRoleController
} from "../controllers/userController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import { authorizeRole } from "../middlewares/authorizeRole.js";

const router = express.Router();

/**
 * Authentication routes
 */
router.post("/register", registerController);
// Register new user → public route

router.post("/login", loginController);
// Login user → public route

router.post("/refresh", refreshTokenController);
// Refresh access token using refresh token → public route

router.post("/logout", authenticateToken, logoutController);
// Logout current device → requires valid access token

router.post("/logout-all", authenticateToken, logoutAllDevicesController);
// Logout from all devices → requires valid access token

/**
 * User info routes (protected)
 */
router.get("/email/:email", authenticateToken, getUserByEmailController);
// Get user by email → requires authentication

router.get("/:id", authenticateToken, getUserController);
// Get user by ID → requires authentication

/**
 * Admin-only routes
 */
router.get("/", authenticateToken, authorizeRole("admin"), getUsersController);
// List all users → requires authentication and admin role

router.put(
  "/:id/role",
  authenticateToken,
  authorizeRole("admin"),
  updateUserRoleController
);
// Update user role → requires authentication and admin role

export default router;
