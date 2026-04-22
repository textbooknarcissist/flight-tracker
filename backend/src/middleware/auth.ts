import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { AuthTokenPayload } from "../types/api";
import { AppError } from "./errorHandler";

export function requireAdminAuth(req: Request, _res: Response, next: NextFunction) {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader?.startsWith("Bearer ")) {
    return next(new AppError("Authorization token is required.", 401));
  }

  const token = authorizationHeader.replace("Bearer ", "").trim();
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    return next(new AppError("JWT secret is not configured.", 500, false));
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
