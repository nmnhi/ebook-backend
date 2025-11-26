/**
 * Middleware: authorizeRole
 * - Restricts access to routes based on user role
 * - Usage: authorizeRole("admin") → only users with role "admin" can access
 *
 * @param {string} requiredRole - The role required to access the route
 * @returns {Function} Express middleware function
 */
export function authorizeRole(requiredRole) {
  return (req, res, next) => {
    // Check if user exists and has the required role
    if (!req.user || req.user.role !== requiredRole) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: insufficient permissions"
      });
    }

    // User has required role → continue to next middleware/controller
    next();
  };
}
