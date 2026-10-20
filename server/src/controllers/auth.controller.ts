import type { Request, Response, NextFunction } from "express";
import { registerAuthor, loginAuthor } from "../services/auth.service.js";
import prisma from "../lib/prisma.js";
import type { AuthenticatedRequest } from "../middlewares/auth.middleware.js";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await registerAuthor(req.body);

    res.cookie("token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "PRODUCTION",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
      path: "/",
    });

    res.status(201).json({
      success: true,
      message: "Registration successful",
      data: { user: result.user },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "EMAIL_ALREADY_EXISTS") {
      res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
      return;
    }

    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {

    const result = await loginAuthor(req.body);

    res.cookie("token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "PRODUCTION",
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000,
      path: "/",
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: result.user,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_CREDENTIALS") {
      res.status(401).json({
        success: false,
        message: "Invalid password",
      });
      return;
    }

    if (error instanceof Error && error.message === "NO_USER_FOUND") {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    next(error);
  }
};

export const logout = (
  _req: Request,
  res: Response,
) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
    path: "/",
  });

  res.status(200).json({
    success: true,
    message: "Logout successful",
  });
};

export const getCurrentUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        city: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};