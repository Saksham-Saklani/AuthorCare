import prisma from "./lib/prisma.js";

async function main() {
  await prisma.$connect();
  console.log("Database connected successfully!");

  const result = await prisma.$queryRaw`SELECT NOW() AS current_time`;
  console.log("Database time:", result);
}

main()
  .catch((error) => {
    console.error("Database connection failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });