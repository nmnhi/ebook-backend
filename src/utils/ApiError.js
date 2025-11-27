// Custom error class to standardize API error handling across the application
export default class ApiError extends Error {
  /**
   * Constructs a new ApiError instance
   * @param {string} message - A human-readable error message
   * @param {number} statusCode - HTTP status code to be returned (default: 500)
   * @param {any} errors - Optional detailed error information (e.g. validation errors)
   */
  constructor(message, statusCode = 500, errors = null) {
    // Call the base Error constructor with the message
    super(message);

    // Set the error name to distinguish from native errors
    this.name = "ApiError";

    // Attach HTTP status code
    this.statusCode = statusCode;

    // Attach additional error details if provided
    this.errors = errors;

    // Preserve the stack trace for debugging (if supported)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }
}
