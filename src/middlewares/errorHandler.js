import ApiError from "../utils/ApiError.js";

/**
 * Global error handling middleware for Express.
 * Catches thrown errors and formats the response using res.error().
 * If the error is an instance of ApiError, it uses its status and details.
 * Otherwise, it returns a generic 500 Internal Server Error.
 */
export default function errorHandler(err, req, res, next) {
  // If the error is a known ApiError, use its status and message
  if (err instanceof ApiError) {
    return res.error(err.statusCode, err.errors ?? err.message);
  }

  // Log unexpected errors for debugging
  console.error("Unhandled error:", err);

  // Return a generic error response
  return res.error(500, err.message || "Internal Server Error");
}
