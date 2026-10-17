import prisma from "../lib/prisma.js";

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