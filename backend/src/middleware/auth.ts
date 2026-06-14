import type { NextFunction, Request, Response } from "express";
import { forbidden, unauthorized } from "../lib/errors.js";
import { verifyToken, type TokenPayload } from "../lib/auth.js";
import type { Role } from "../types.js";

declare module "express-serve-static-core" {
  interface Request {
    user?: TokenPayload;
  }
}

export function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    throw unauthorized("Missing or malformed Authorization header");
  }
  const token = header.slice("Bearer ".length).trim();
  try {
    req.user = verifyToken(token);
  } catch {
    throw unauthorized("Invalid or expired token");
  }
  next();
}

export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw unauthorized();
    }
    if (!roles.includes(req.user.role)) {
      throw forbidden("You do not have permission to perform this action");
    }
    next();
  };
}
