/**
 * Response middleware to add helper methods to the Express response object.
 * Provides res.success() and res.error() for consistent API responses.
 */
export default (req, res, next) => {
  /**
   * Send a success response
   * @param {any} data - The payload to return to the client
   * @param {number} status - HTTP status code (default: 200)
   */
  res.success = (status = 200, data = null) => {
    res.status(status).json({
      success: true,
      data
    });
  };

  /**
   * Send an error responsez
   * @param {number} status - HTTP status code (default: 400)
   * @param {any} errors - Optional detailed error information (e.g. validation errors)
   */
  res.error = (status = 400, errors = null) => {
    res.status(status).json({
      success: false,
      errors
    });
  };

  next();
};
