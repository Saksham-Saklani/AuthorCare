import prisma from "../lib/prisma.js";
import type { CreateTicketInput } from "../validations/ticket.validation.js";

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