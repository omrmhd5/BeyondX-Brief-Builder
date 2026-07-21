import type { Request, Response, NextFunction } from "express";
import type { ApiErrorResponse } from "../types/brief.js";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  console.error("[errorHandler]", err);

  const isProd = process.env.NODE_ENV === "production";
  const body: ApiErrorResponse = {
    success: false,
    error: {
      message: isProd ? "Internal server error" : err.message,
    },
  };

  res.status(500).json(body);
}
