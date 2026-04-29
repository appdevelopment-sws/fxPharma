import { ZodError } from "zod";

/**
 * Formats a ZodError into a simple key-value object
 * @param error ZodError instance
 * @returns Record<string, string> where key is the field path and value is the message
 */
export const formatZodError = (error: ZodError) => {
  const errors: Record<string, string> = {};

  // Zod uses 'issues' for the error list
  const issues = error.issues || (error as any).errors || [];

  issues.forEach((err: any) => {
    // Join path with dots for nested fields
    const path = err.path.join(".");
    errors[path] = err.message;
  });

  return errors;
};
