
import { readFileSync } from "node:fs";
import bcrypt from "bcrypt";
import  prisma from "../src/lib/prisma.js";

interface SampleBook {
  book_id: string;
  title: string;
  isbn: string;
  genre: string;
  publication_date: string | null;
  status: string;
  mrp: number | null;
  author_royalty_per_copy: number | null;
  total_copies_sold: number;
  total_royalty_earned: number;
  royalty_paid: number;
  royalty_pending: number;
  last_royalty_payout_date: string | null;
  print_partner: string | null;
  available_on: string[];
}

interface SampleAuthor {
  author_id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  joined_date: string;
  books: SampleBook[];
}

interface SampleData {
  authors: SampleAuthor[];
}

const toDateOrNull = (value: string | null) =>
  value ? new Date(value) : null;

async function main() {
  const seedPassword = "Password123";

  const file = readFileSync(
    new URL("./migrations/seeding-data.json", import.meta.url),
    "utf8",
  );


  const sampleData = JSON.parse(file) as SampleData;
  const passwordHash = await bcrypt.hash(seedPassword, 12);

  let authorCount = 0;
  let bookCount = 0;

  for (const authorData of sampleData.authors) {
    const author = await prisma.user.upsert({
      where: { email: authorData.email },
      update: {
        name: authorData.name,
        phone: authorData.phone,
        city: authorData.city,
        joinedDate: new Date(authorData.joined_date),
      },
      create: {
        name: authorData.name,
        email: authorData.email,
        passwordHash,
        role: "AUTHOR",
        phone: authorData.phone,
        city: authorData.city,
        joinedDate: new Date(authorData.joined_date),
      },
    });

    authorCount++;

    for (const bookData of authorData.books) {
      await prisma.book.upsert({
        where: { isbn: bookData.isbn },
        update: {
          title: bookData.title,
          genre: bookData.genre,
          publicationDate: toDateOrNull(
            bookData.publication_date,
          ),
          status: bookData.status,
          mrp: bookData.mrp,
          authorRoyaltyPerCopy: bookData.author_royalty_per_copy,
          totalCopiesSold: bookData.total_copies_sold,
          totalRoyaltyEarned: bookData.total_royalty_earned,
          royaltyPaid: bookData.royalty_paid,
          royaltyPending: bookData.royalty_pending,
          lastRoyaltyPayoutDate: toDateOrNull(
            bookData.last_royalty_payout_date,
          ),
          printPartner: bookData.print_partner,
          availableOn: bookData.available_on,
          authorId: author.id,
        },
        create: {
          title: bookData.title,
          isbn: bookData.isbn,
          genre: bookData.genre,
          publicationDate: toDateOrNull(
            bookData.publication_date,
          ),
          status: bookData.status,
          mrp: bookData.mrp,
          authorRoyaltyPerCopy: bookData.author_royalty_per_copy,
          totalCopiesSold: bookData.total_copies_sold,
          totalRoyaltyEarned: bookData.total_royalty_earned,
          royaltyPaid: bookData.royalty_paid,
          royaltyPending: bookData.royalty_pending,
          lastRoyaltyPayoutDate: toDateOrNull(
            bookData.last_royalty_payout_date,
          ),
          printPartner: bookData.print_partner,
          availableOn: bookData.available_on,
          authorId: author.id,
        },
      });

      bookCount++;
    }
  }

  console.log(`Seed completed: ${authorCount} authors processed.`);
  console.log(`Seed completed: ${bookCount} books processed.`);
}

main()
  .catch((error: unknown) => {
    console.error("Seeding failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });