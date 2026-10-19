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

export const getBookById = async(bookId: string) => {
    return prisma.book.findUnique({
        where: {
            id: bookId,
        },
        include: {
            author:{
                select:{
                    name: true,
                    email: true
                }
            }
        }
    });
};  