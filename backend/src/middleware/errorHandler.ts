import { NextFunction, Request, Response } from "express";

export class AppError extends Error {
  statusCode: number;

  expose: boolean;

  constructor(message: string, statusCode = 500, expose = true) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.expose = expose;
  }
}

export function notFoundHandler(_req: Request, _res: Response, next: NextFunction) {
  next(new AppError("Route not found.", 404));
}

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      message: error.expose ? error.message : "Something went wrong.",
    });
  }

  console.error(error);

  return res.status(500).json({
    message: "Internal server error.",
  });
}
