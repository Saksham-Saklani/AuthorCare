import prisma from "../lib/prisma.js";
import { emitTicketUpdated } from "../utils/socket.js";

export const createAuthorMessage = async (
  ticketId: string,
  authorId: string,
  body: string,
) => {
  // Verify that the ticket belongs to this author.
  const ticket = await prisma.ticket.findFirst({
    where: {
      id: ticketId,
      authorId,
    },
    select: {
      id: true,
    },
  });

  if (!ticket) {
    throw new Error("TICKET_NOT_FOUND");
  }

  // Create a public message.
  return prisma.message.create({
    data: {
      body,
      ticketId: ticket.id,
      senderId: authorId,
      visibility: "PUBLIC",
    },
  });
};

export const sendAdminMessage = async (
  ticketId: string,
  adminId: string,
  body: string,
  visibility: "PUBLIC" | "INTERNAL",
) => {
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    select: { id: true },
  });

  if (!ticket) {
    throw new Error("TICKET_NOT_FOUND");
  }

  const message = await prisma.message.create({
    data: {
      body,
      ticketId: ticket.id,
      senderId: adminId,
      visibility,
    },
  });
  
  emitTicketUpdated(ticketId);
  return message;
};

export const conversationHistory = async (ticketId: string) => {
  const messages = await prisma.message.findMany({
    where: {
      ticketId,
      visibility: "PUBLIC",
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 10,
    select: {
      body: true,
      senderId: true,
      sender: {
        select: {
          role: true,
        },
      },
      createdAt: true,
    },
  });

  if(messages.length === 0) {
    return "No messages yet";
  }

  return messages
    .reverse()
    .map((message) => {
      const speaker =
        message.sender.role === "AUTHOR" ? "AUTHOR" : "ADMIN";

      return `[${speaker}] ${message.body}`;
    })
    .join("\n\n");
};