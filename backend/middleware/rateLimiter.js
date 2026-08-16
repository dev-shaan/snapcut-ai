import rateLimit from "express-rate-limit";

// Window duration in milliseconds (default: 15 minutes = 900,000 ms)
const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000", 10);

// Max requests allowed per IP within window (default: 30 requests)
const maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "30", 10);

export const apiLimiter = rateLimit({
  windowMs,
  max: maxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "Too many processing requests from this IP. Please try again later.",
  },
  statusCode: 429,
});
