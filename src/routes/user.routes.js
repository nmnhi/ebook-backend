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

// Auth routes
router.post("/register", registerController);
router.post("/login", loginController);
router.post("/refresh", refreshTokenController);
router.post("/logout", authenticateToken, logoutController);
router.post("/logout-all", authenticateToken, logoutAllDevicesController);

// User info routes (protected)
router.get("/email/:email", authenticateToken, getUserByEmailController);
router.get("/:id", authenticateToken, getUserController);

// Admin-only route to list all users
router.get("/", authenticateToken, authorizeRole("admin"), getUsersController);

// Update user role (admin only)
router.put(
  "/:id/role",
  authenticateToken,
  authorizeRole("admin"),
  updateUserRoleController
);
export default router;
