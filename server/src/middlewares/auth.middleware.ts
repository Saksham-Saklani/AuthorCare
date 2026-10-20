import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface AuthPayload {
  userId: string;
  role: "AUTHOR" | "ADMIN";
}

export interface AuthenticatedRequest extends Request {
  user?: AuthPayload;
}

export const authenticate = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  // Accept token from Authorization header (cross-origin) or cookie (same-site)
  const authHeader = req.headers.authorization;
  const token: string | undefined =
    authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : req.cookies?.token;

  if (!token) {
    res.status(401).json({
      success: false,
      message: "Authentication required",
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);

    if (
      typeof decoded !== "object" ||
      !("userId" in decoded) ||
      !("role" in decoded) ||
      typeof decoded.userId !== "string" ||
      (decoded.role !== "AUTHOR" && decoded.role !== "ADMIN")
    ) {
      res.status(401).json({
        success: false,
        message: "Invalid authentication token",
      });
      return;
    }

    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };

    next();
  } catch {
    res.status(401).json({
      success: false,
      message: "Invalid or expired authentication token",
    });
  }
};