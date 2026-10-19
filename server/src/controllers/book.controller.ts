import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { getAuthorBooks, getBookById } from "../services/book.service.js";

export const getBooks = async (
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

    const books = await getAuthorBooks(req.user.userId);

    res.status(200).json({
      success: true,
      count: books.length,
      data: { books },
    });
  } catch (error) {
    next(error);
  }
};

export const getBookByIdHandler = async (
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

    const bookId = req.params.id

    if (!bookId) {
        res.status(400).json({
            success: false,
            message: "Book ID is required",
        });
        return;
    }

    if (typeof bookId !== "string") {
        res.status(400).json({
            success: false,
            message: "Invalid Book ID",
        });
        return;
    }

    const book = await getBookById(bookId);

    res.status(200).json({
      success: true,
      data: { book },
    });
  } catch (error) {
    next(error);
  }
};
    