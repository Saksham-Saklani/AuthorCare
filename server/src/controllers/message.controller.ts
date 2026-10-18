import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { createAuthorMessage, sendAdminMessage } from "../services/message.service.js";

export const createAuthorMessageHandler = async (
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

    const message = await createAuthorMessage(
      ticketId,
      req.user.userId,
      req.body.body,
    );

    res.status(201).json({
      success: true,
      message: "Reply added successfully",
      data: { message },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "TICKET_NOT_FOUND") {
      res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
      return;
    }

    next(error);
  }
};

export const sendAdminMessageHandler = async(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
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

    if (!ticketId) {
        res.status(400).json({
            success: false,
            message: "Ticket ID is required",
        });
        return;
    }

    if (typeof ticketId !== "string") {
        res.status(400).json({
            success: false,
            message: "Invalid ticket ID",
        });
        return;
    }

    const ticket = await sendAdminMessage(ticketId, req.user.userId, req.body.body, req.body.visibility);

    res.status(200).json({
        success: true,
        message: "Message sent successfully",
        data: ticket,
    });
    } catch (error) {
        next(error);
    }
}