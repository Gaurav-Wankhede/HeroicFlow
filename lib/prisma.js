import { PrismaClient } from "@prisma/client";

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
const globalForPrisma = global;

if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    },
    log: ['query', 'error', 'warn']
  });
}

const prisma = globalForPrisma.prisma;

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export { prisma };