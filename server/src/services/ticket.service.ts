import prisma from "../lib/prisma.js";
import { Prisma, TicketStatus, TicketCategory, TicketPriority } from "../generated/prisma/client.js";
import type { CreateTicketInput, AdminTicketQuery, UpdateTicketInput } from "../validations/ticket.validation.js";
import { classifyTicket } from "./ai.service.js";

export const createTicket = async (
  authorId: string,
  input: CreateTicketInput,
) => {
  // If a book was selected, verify that it belongs to this author.
  if (input.bookId) {
    const book = await prisma.book.findFirst({
      where: {
        id: input.bookId,
        authorId,
      },
      select: {
        id: true,
      },
    });

    if (!book) {
      throw new Error("BOOK_NOT_FOUND");
    }
  }

  let category: TicketCategory = "GENERAL_INQUIRY";
  let priority: TicketPriority = "MEDIUM";
  let aiProcessed = false;

  // AI Classification
  try {
    const classification = await classifyTicket(input.subject, input.description);

    if (classification) {
      category = classification.category;
      priority = classification.priority;
      aiProcessed = true
    }
  } catch (error) {
    console.error("AI Classification failed:", error);
  }




  // Create the ticket using the authenticated author's ID.
  return prisma.ticket.create({
    data: {
      subject: input.subject,
      description: input.description,
      authorId,
      bookId: input.bookId ?? null,
      category,
      priority,
      aiProcessed,
    },
  });
};

export const getAuthorTickets = async (authorId: string) => {
  return prisma.ticket.findMany({
    where: {
      authorId,
    },
    include: {
      book: {
        select: {
          id: true,
          title: true,
          isbn: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getAuthorTicketById = async (
  ticketId: string,
  authorId: string,
) => {
  return prisma.ticket.findFirst({
    where: {
      id: ticketId,
      authorId,
    },
    include: {
      book: {
        select: {
          id: true,
          title: true,
          isbn: true,
        },
      },
      messages: {
        where: {
          visibility: "PUBLIC",
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });
};

export const getAllTickets = async (filters: AdminTicketQuery) => {
  const { status, category, priority, from, to, page, limit } = filters;

  const where: Prisma.TicketWhereInput = {};

  // Checking filters

  if (status) {
    where.status = status as TicketStatus;
  }

  if (category) {
    where.category = category as TicketCategory;
  }

  if (priority) {
    where.priority = priority as TicketPriority;
  }

  if (from || to) {
    where.createdAt = {};

    if (from) {
      where.createdAt.gte = new Date(from);
    }

    if (to) {
      const endDate = new Date(to);
      endDate.setUTCDate(endDate.getUTCDate() + 1);
      where.createdAt.lt = endDate;
    }
  }

  // Pagination 

  const [tickets, total] = await Promise.all([
    prisma.ticket.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        book: {
          select: {
            id: true,
            title: true,
            isbn: true,
          },
        },
      },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.ticket.count({ where }),
  ]);

  return {
    tickets,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const updateTicket = async (
  ticketId: string,
  input: UpdateTicketInput,
) => {
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    select: { id: true },
  });

  if (!ticket) {
    throw new Error("TICKET_NOT_FOUND");
  }

  const data: Prisma.TicketUpdateInput = {};
  if (input.status !== undefined) data.status = input.status;
  if (input.priority !== undefined) data.priority = input.priority;
  if (input.category !== undefined) data.category = input.category;

  return prisma.ticket.update({
    where: { id: ticketId },
    data,
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      book: {
        select: {
          id: true,
          title: true,
          isbn: true,
        },
      },
    },
  });
};

export const assignTicket = async (
  ticketId: string,
  adminId: string,
) => {
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    select: {
      id: true,
      assignedToId: true,
    },
  });

  if (!ticket) {
    throw new Error("TICKET_NOT_FOUND");
  }

  return prisma.ticket.update({
    where: { id: ticketId },
    data: {
      assignedToId: adminId,
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
};
