import { Request, Response, NextFunction } from 'express';

/**
 * Simple in-memory rate limiter
 * For production, use Redis-based rate limiting (e.g., express-rate-limit with Redis)
 */

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

/**
 * Rate limiter middleware
 */
export function rateLimiter(
  windowMs: number = 15 * 60 * 1000, // 15 minutes
  maxRequests: number = 100
) {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = (req as any).userId || req.ip;
    const now = Date.now();

    // Clean up old entries
    Object.keys(store).forEach(k => {
      if (store[k].resetTime < now) {
        delete store[k];
      }
    });

    // Get or create entry
    if (!store[key] || store[key].resetTime < now) {
      store[key] = {
        count: 1,
        resetTime: now + windowMs,
      };
      return next();
    }

    // Check limit
    if (store[key].count >= maxRequests) {
      return res.status(429).json({
        error: {
          message: 'Too many requests, please try again later',
          retryAfter: Math.ceil((store[key].resetTime - now) / 1000),
        },
      });
    }

    // Increment count
    store[key].count++;
    next();
  };
}

