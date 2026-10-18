import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import {
  createTicket,
  getAuthorTickets,
  getAuthorTicketById,
  getAllTickets,
  updateTicket,
  assignTicket,
  generateTicketReply,
  getAdminTicketById,
} from "../services/ticket.service.js";
import type { AdminTicketQuery, UpdateTicketInput } from "../validations/ticket.validation.js";

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

export const getAllTicketsHandler = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const query = res.locals.validatedQuery as AdminTicketQuery;

    const result = await getAllTickets(query);

    res.status(200).json({
      success: true,
      data: result.tickets,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

export const updateTicketHandler = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
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

    const input = req.body as UpdateTicketInput;

    const ticket = await updateTicket(ticketId, input);

    res.status(200).json({
      success: true,
      message: "Ticket updated successfully",
      data: ticket,
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

export const assignTicketHandler = async (
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

    const ticket = await assignTicket(ticketId, req.user.userId);

    res.status(200).json({
      success: true,
      message: "Ticket assigned successfully",
      data: ticket,
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

export const generateTicketReplyHandler = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    try{
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

    const ticket = await generateTicketReply(ticketId);

    res.status(200).json({
        success: true,
        message: "Reply generated successfully",
        data: ticket,
    });
    }
   
catch (error) {
    if (error instanceof Error && error.message === "TICKET_NOT_FOUND") {
        res.status(404).json({
            success: false,
            message: "Ticket not found",
        });
        return;
    }
    next(error);
}
}

export const getAdminTicketByIdHandler = async (
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

    const ticket = await getAdminTicketById(ticketId);

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



