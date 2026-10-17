import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { createTicket, getAuthorTickets, getAuthorTicketById } from "../services/ticket.service.js";

export const createTicketHandler = async (
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

    const ticket = await createTicket(req.user.userId, req.body);

    res.status(201).json({
      success: true,
      message: "Ticket created successfully",
      data: { ticket },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "BOOK_NOT_FOUND") {
      res.status(404).json({
        success: false,
        message: "Book not found",
      });
      return;
    }

    next(error);
  }
};

export const getAuthorTicketsHandler = async (
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

    const tickets = await getAuthorTickets(req.user.userId);

    res.status(200).json({
      success: true,
      count: tickets.length,
      data: { tickets },
    });
  } catch (error) {
    next(error);
  }
};

export const getAuthorTicketByIdHandler = async (
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

    const ticketId = req.params.id;

    if (typeof ticketId !== "string") {
    res.status(400).json({
        success: false,
        message: "Invalid ticket ID",
    });
    return;
    }

    const ticket = await getAuthorTicketById(ticketId, req.user.userId);

    if (!ticket) {
      res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: { ticket },
    });
  } catch (error) {
    next(error);
  }
};