import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import type { AuthTokenPayload } from "../types/api";
import { AppError } from "./errorHandler";

function readCookieValue(cookieHeader: string | undefined, name: string) {
  if (!cookieHeader) {
    return undefined;
  }

  const cookie = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));

  if (!cookie) {
    return undefined;
  }

  return decodeURIComponent(cookie.slice(name.length + 1));
}

/**
 * Reads the JWT from either:
 *   1. The `auth_token` HttpOnly cookie  (preferred — immune to XSS)
 *   2. The `Authorization: Bearer …` header (kept for API clients / tests)
 *
 * Cookie takes precedence. The dual-mode approach keeps automated tests
 * working without changes while browsers benefit from the secure cookie path.
 */
export function requireAdminAuth(req: Request, _res: Response, next: NextFunction) {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    return next(new AppError("JWT secret is not configured.", 500, false));
  }

  // Try cookie first, then Authorization header
  const cookieToken = readCookieValue(req.headers.cookie, "auth_token");
  const authHeader = req.headers.authorization;
  const bearerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.replace("Bearer ", "").trim()
    : undefined;

  const token = cookieToken ?? bearerToken;

  if (!token) {
    return next(new AppError("Authorization token is required.", 401));
  }

  try {
    const payload = jwt.verify(token, secret) as AuthTokenPayload;
    req.admin = {
      id: payload.adminId,
      username: payload.username,
    };

    return next();
  } catch {
    return next(new AppError("Invalid or expired authorization token.", 401));
  }
}
