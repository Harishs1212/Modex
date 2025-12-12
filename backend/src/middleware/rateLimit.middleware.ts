import rateLimit from 'express-rate-limit';

// Key generator that works with trust proxy
const keyGenerator = (req: any) => {
  // Use X-Forwarded-For header if available (from Railway load balancer)
  // Fall back to IP address
  return req.headers['x-forwarded-for']?.split(',')[0] || req.ip || req.connection.remoteAddress || 'unknown';
};

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator,
  // Skip validation warnings for trust proxy
  validate: {
    trustProxy: false, // We handle it manually
  },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 login attempts per 15 minutes (increased for development)
  message: 'Too many login attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator,
  // Skip validation warnings for trust proxy
  validate: {
    trustProxy: false, // We handle it manually
  },
  skip: (_req) => {
    // Skip rate limiting in development mode
    return process.env.NODE_ENV === 'development';
  },
});

