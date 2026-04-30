import { Request, Response, NextFunction } from "express";

/**
 * Wraps an async function and catches any errors, passing them to the next middleware.
 * Eliminates the need for try-catch blocks in every controller.
 */
export const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
