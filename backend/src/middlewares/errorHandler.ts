import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { formatZodError } from "../utils/errorFormatter.js";

const formatValidationMessage = (errors: Record<string, string>) => {
  const fieldMessages = Object.entries(errors).map(
    ([field, message]) => `${field}: ${message}`
  );

  return fieldMessages.length
    ? `Validation failed. ${fieldMessages.join(" | ")}`
    : "Validation failed";
};

/**
 * Global error handling middleware for Express
 */
export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // If it's a Zod validation error
  if (err instanceof ZodError) {
    const errors = formatZodError(err);
    return res.status(400).json({
      success: false,
      message: formatValidationMessage(errors),
      errors,
    });
  }

  // Handle other types of errors
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  // Log error for developers
  if (process.env.NODE_ENV !== "test") {
    console.error(`[Error] ${req.method} ${req.path}:`, err);
  }

  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
