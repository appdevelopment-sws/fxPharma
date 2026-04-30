/**
 * ErrorHandler Class
 * Extends the built-in Error class to support HTTP status codes.
 * This allows the global error handler middleware to send specific status codes to the client.
 */
class ErrorHandler extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;

    // Maintain proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export default ErrorHandler;
