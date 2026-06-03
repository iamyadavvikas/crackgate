/** Shared Prisma client singleton — consumed by apps/web via the
 *  `@crackgate/database` workspace package.
 *
 *  The singleton pattern prevents Next.js dev-mode hot-reload from
 *  exhausting the Postgres connection pool. */
import { PrismaClient } from "./generated/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

// Re-export Prisma types so consumers don't need a direct dependency on @prisma/client
export * from "./generated/client";
