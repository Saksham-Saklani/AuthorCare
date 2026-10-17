import prisma from "../lib/prisma.js";
import { Prisma, TicketStatus, TicketCategory, TicketPriority } from "../generated/prisma/client.js";
import type { CreateTicketInput, AdminTicketQuery } from "../validations/ticket.validation.js";

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

  // Create the ticket using the authenticated author's ID.
  return prisma.ticket.create({
    data: {
      subject: input.subject,
      description: input.description,
      authorId,
      bookId: input.bookId ?? null,
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