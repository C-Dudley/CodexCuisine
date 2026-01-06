/**
 * Authentication Middleware for CodexCuisine
 *
 * Provides authentication for Express routes using JWT tokens from httpOnly cookies
 * Adapted from CodexClarity's auth-middleware pattern
 */

import { Request, Response, NextFunction } from "express";
import {
  verifyAccessToken,
  extractAccessToken,
  DecodedToken,
} from "../services/jwt-utils";

/**
 * Extend Express Request to include authenticated user context
 */
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role?: string;
        plan?: string;
      };
    }
  }
}

/**
 * Extract and verify user from JWT token in httpOnly cookie
 *
 * @param req - Express Request object
 * @returns Decoded user information or null
 */
export function getUserFromRequest(req: Request): DecodedToken | null {
  try {
    const cookieHeader = req.headers.cookie;
    if (!cookieHeader) {
      return null;
    }

    const accessToken = extractAccessToken(cookieHeader);
    if (!accessToken) {
      return null;
    }

    // Verify and decode token
    const decoded = verifyAccessToken(accessToken);
    return decoded;
  } catch (error: any) {
    // Token verification failed (expired, invalid, etc.)
    console.error("Token verification failed:", error.message);
    return null;
  }
}

/**
 * Middleware that extracts user from token and attaches to req.user
 * Does NOT block unauthenticated requests - those are allowed to proceed
 * Use requireAuth() for routes that need authentication
 */
export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const user = getUserFromRequest(req);

    if (user) {
      // Attach decoded user to request object
      req.user = {
        userId: user.userId,
        email: user.email,
        role: user.role,
        plan: user.plan,
      };
    }

    // Always continue, even if no user (optional auth)
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    next(); // Don't fail the whole request
  }
}

/**
 * Require authentication middleware
 * Returns 401 if user is not authenticated
 * Use this for protected routes
 */
export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const user = getUserFromRequest(req);

    if (!user) {
      res.status(401).json({
        error: "Unauthorized",
        message: "Authentication required",
      });
      return;
    }

    // Attach user to request
    req.user = {
      userId: user.userId,
      email: user.email,
      role: user.role,
      plan: user.plan,
    };

    next();
  } catch (error: any) {
    console.error("Auth verification error:", error.message);

    if (error.message === "Token has expired") {
      res.status(401).json({
        error: "Unauthorized",
        message: "Token expired. Please refresh your session.",
      });
    } else {
      res.status(401).json({
        error: "Unauthorized",
        message: "Invalid authentication token",
      });
    }
  }
}

/**
 * Require admin role middleware
 * Returns 403 if user is not an admin
 */
export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const user = getUserFromRequest(req);

    if (!user) {
      res.status(401).json({
        error: "Unauthorized",
        message: "Authentication required",
      });
      return;
    }

    if (user.role !== "admin") {
      res.status(403).json({
        error: "Forbidden",
        message: "Admin access required",
      });
      return;
    }

    req.user = {
      userId: user.userId,
      email: user.email,
      role: user.role,
      plan: user.plan,
    };

    next();
  } catch (error) {
    res.status(401).json({
      error: "Unauthorized",
      message: "Invalid authentication token",
    });
  }
}

/**
 * Require specific plan tier middleware
 * Returns 403 if user doesn't have required plan
 */
export function requirePlan(requiredPlan: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const user = getUserFromRequest(req);

      if (!user) {
        res.status(401).json({
          error: "Unauthorized",
          message: "Authentication required",
        });
        return;
      }

      const planHierarchy: { [key: string]: number } = {
        free: 1,
        pro: 2,
        enterprise: 3,
      };

      const userPlanLevel = planHierarchy[user.plan || "free"] || 1;
      const requiredPlanLevel = planHierarchy[requiredPlan] || 1;

      if (userPlanLevel < requiredPlanLevel) {
        res.status(403).json({
          error: "Forbidden",
          message: `${requiredPlan} plan required`,
        });
        return;
      }

      req.user = {
        userId: user.userId,
        email: user.email,
        role: user.role,
        plan: user.plan,
      };

      next();
    } catch (error) {
      res.status(401).json({
        error: "Unauthorized",
        message: "Invalid authentication token",
      });
    }
  };
}

/**
 * Verify user owns resource middleware
 * Checks if the userId in the request matches the authenticated user
 */
export function requireOwnership(
  getUserIdFromRequest: (req: Request) => string | null
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const user = getUserFromRequest(req);

      if (!user) {
        res.status(401).json({
          error: "Unauthorized",
          message: "Authentication required",
        });
        return;
      }

      const resourceUserId = getUserIdFromRequest(req);

      if (!resourceUserId || resourceUserId !== user.userId) {
        res.status(403).json({
          error: "Forbidden",
          message: "You do not have permission to access this resource",
        });
        return;
      }

      req.user = {
        userId: user.userId,
        email: user.email,
        role: user.role,
        plan: user.plan,
      };

      next();
    } catch (error) {
      res.status(401).json({
        error: "Unauthorized",
        message: "Invalid authentication token",
      });
    }
  };
}
