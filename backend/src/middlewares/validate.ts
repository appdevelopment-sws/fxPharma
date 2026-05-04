import { Request, Response, NextFunction } from "express";
import { ZodTypeAny } from "zod";

/**
 * Middleware to validate request body against a Zod schema.
 * Using ZodTypeAny to ensure compatibility across all Zod versions and schema types.
 */
export const validate = (schema: ZodTypeAny) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      // Pass the error to the global error handler.
      next(error);
    }
  };
};
