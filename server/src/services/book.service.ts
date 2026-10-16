import prisma from "../lib/prisma.js";

export const getAuthorBooks = async (authorId: string) => {
  return prisma.book.findMany({
    where: {
      authorId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};