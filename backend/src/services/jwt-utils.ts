/**
 * JWT Token Management for CodexCuisine
 *
 * Adapted from CodexClarity's auth system
 * Handles JWT token creation, verification, and extraction from httpOnly cookies
 * Uses environment variable SESSION_SECRET for signing
 */

import jwt from "jsonwebtoken";

// ==================== Types ====================

export interface TokenPayload {
  userId: string;
  email: string;
  role?: string;
  plan?: string;
  type: "access" | "refresh";
}

export interface DecodedToken extends TokenPayload {
  iat: number; // Issued at (Unix timestamp)
  exp: number; // Expiration (Unix timestamp)
}

// Token expiry constants (matching CodexClarity)
const SESSION = {
  COOKIE_NAME: "codexclarity_session",
  REFRESH_COOKIE_NAME: "codexclarity_refresh",
  ACCESS_TOKEN_EXPIRY: 15 * 60, // 15 minutes in seconds
  REFRESH_TOKEN_EXPIRY: 7 * 24 * 60 * 60, // 7 days in seconds
};

// ==================== Token Generation ====================

/**
 * Generate an access token (short-lived, 15 minutes)
 */
export function generateAccessToken(
  userId: string,
  email: string,
  role?: string,
  plan?: string
): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET environment variable not set");
  }

  const payload: TokenPayload = {
    userId,
    email,
    role,
    plan,
    type: "access",
  };

  return jwt.sign(payload, secret, {
    expiresIn: SESSION.ACCESS_TOKEN_EXPIRY,
    issuer: "codexcuisine",
    audience: "codexcuisine-api",
  });
}

/**
 * Generate a refresh token (long-lived, 7 days)
 */
export function generateRefreshToken(userId: string, email: string): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET environment variable not set");
  }

  const payload: TokenPayload = {
    userId,
    email,
    type: "refresh",
  };

  return jwt.sign(payload, secret, {
    expiresIn: SESSION.REFRESH_TOKEN_EXPIRY,
    issuer: "codexcuisine",
    audience: "codexcuisine-api",
  });
}

/**
 * Generate both access and refresh tokens
 */
export function generateTokenPair(
  userId: string,
  email: string,
  role?: string,
  plan?: string
): { accessToken: string; refreshToken: string } {
  return {
    accessToken: generateAccessToken(userId, email, role, plan),
    refreshToken: generateRefreshToken(userId, email),
  };
}

// ==================== Token Verification ====================

/**
 * Verify and decode a JWT token
 */
export function verifyToken(
  token: string,
  expectedType: "access" | "refresh" = "access"
): DecodedToken {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET environment variable not set");
  }

  try {
    const decoded = jwt.verify(token, secret, {
      issuer: "codexcuisine",
      audience: "codexcuisine-api",
    }) as DecodedToken;

    // Verify token type
    if (decoded.type !== expectedType) {
      throw new Error(
        `Invalid token type. Expected ${expectedType}, got ${decoded.type}`
      );
    }

    return decoded;
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      throw new Error("Token has expired");
    }
    if (error.name === "JsonWebTokenError") {
      throw new Error("Invalid token");
    }
    throw error;
  }
}

/**
 * Verify access token specifically
 */
export function verifyAccessToken(token: string): DecodedToken {
  return verifyToken(token, "access");
}

/**
 * Verify refresh token specifically
 */
export function verifyRefreshToken(token: string): DecodedToken {
  return verifyToken(token, "refresh");
}

// ==================== Token Extraction from Cookies ====================

/**
 * Extract access token from cookie header string
 */
export function extractAccessToken(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(";").map((c) => c.trim());
  const tokenCookie = cookies.find((c) =>
    c.startsWith(`${SESSION.COOKIE_NAME}=`)
  );

  if (!tokenCookie) return null;

  return tokenCookie.substring(SESSION.COOKIE_NAME.length + 1);
}

/**
 * Extract refresh token from cookie header string
 */
export function extractRefreshToken(
  cookieHeader: string | null
): string | null {
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(";").map((c) => c.trim());
  const tokenCookie = cookies.find((c) =>
    c.startsWith(`${SESSION.REFRESH_COOKIE_NAME}=`)
  );

  if (!tokenCookie) return null;

  return tokenCookie.substring(SESSION.REFRESH_COOKIE_NAME.length + 1);
}

// ==================== Cookie Management ====================

/**
 * Create cookie options for httpOnly cookies
 */
export function createCookieOptions(maxAge: number): {
  httpOnly: boolean;
  secure: boolean;
  sameSite: "strict" | "lax" | "none";
  maxAge: number;
  path: string;
} {
  return {
    httpOnly: true, // Prevents JavaScript access (XSS protection)
    secure: process.env.NODE_ENV === "production", // HTTPS only in production
    sameSite: "strict", // CSRF protection
    maxAge, // In seconds
    path: "/",
  };
}

/**
 * Format cookie string for Set-Cookie header
 */
export function formatCookieString(
  name: string,
  value: string,
  options: ReturnType<typeof createCookieOptions>
): string {
  const parts = [
    `${name}=${value}`,
    `Path=${options.path}`,
    `Max-Age=${options.maxAge}`,
    `SameSite=${options.sameSite}`,
  ];

  if (options.httpOnly) {
    parts.push("HttpOnly");
  }

  if (options.secure) {
    parts.push("Secure");
  }

  return parts.join("; ");
}

/**
 * Create Set-Cookie header for access token
 */
export function setAccessTokenCookie(accessToken: string): string {
  const options = createCookieOptions(SESSION.ACCESS_TOKEN_EXPIRY);
  return formatCookieString(SESSION.COOKIE_NAME, accessToken, options);
}

/**
 * Create Set-Cookie header for refresh token
 */
export function setRefreshTokenCookie(refreshToken: string): string {
  const options = createCookieOptions(SESSION.REFRESH_TOKEN_EXPIRY);
  return formatCookieString(SESSION.REFRESH_COOKIE_NAME, refreshToken, options);
}

/**
 * Create Set-Cookie headers to clear auth cookies
 */
export function clearAuthCookies(): string[] {
  const expiredOptions = createCookieOptions(0); // maxAge: 0 expires immediately

  return [
    formatCookieString(SESSION.COOKIE_NAME, "", expiredOptions),
    formatCookieString(SESSION.REFRESH_COOKIE_NAME, "", expiredOptions),
  ];
}

// ==================== Utility Functions ====================

/**
 * Check if token is expiring soon (within 5 minutes)
 */
export function isTokenExpiringSoon(token: string): boolean {
  try {
    const decoded = jwt.decode(token) as DecodedToken;
    if (!decoded || !decoded.exp) return true;

    const now = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = decoded.exp - now;

    return timeUntilExpiry < 300; // Less than 5 minutes
  } catch {
    return true;
  }
}

/**
 * Get token expiration time
 */
export function getTokenExpiration(token: string): Date | null {
  try {
    const decoded = jwt.decode(token) as DecodedToken;
    if (!decoded || !decoded.exp) return null;

    return new Date(decoded.exp * 1000);
  } catch {
    return null;
  }
}

/**
 * Rotate refresh token (generate new pair)
 * Used when refreshing access token to prevent reuse attacks
 */
export function rotateRefreshToken(
  oldRefreshToken: string,
  userId: string,
  email: string,
  role?: string,
  plan?: string
): { accessToken: string; refreshToken: string } | null {
  try {
    // Verify old refresh token
    const decoded = verifyRefreshToken(oldRefreshToken);

    // Verify user ID matches
    if (decoded.userId !== userId) {
      throw new Error("User ID mismatch");
    }

    // Generate new token pair
    return generateTokenPair(userId, email, role, plan);
  } catch (error) {
    console.error("Refresh token rotation failed:", error);
    return null;
  }
}
