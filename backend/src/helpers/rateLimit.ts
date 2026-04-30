import rateLimit from "express-rate-limit";

const isDevelopment = process.env.NODE_ENV === "development";

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: isDevelopment ? Infinity : 20,
  standardHeaders: true,
  legacyHeaders: false,
});

const generalLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: isDevelopment ? Infinity : 100,
  standardHeaders: true,
  legacyHeaders: false,
});

export { generalLimiter, authLimiter };