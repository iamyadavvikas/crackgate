/** Re-export the shared Prisma singleton from the @crackgate/database
 *  workspace package. Pre-monorepo this file held the PrismaClient itself;
 *  now it's a thin facade so existing `import { db } from "@/lib/db"`
 *  callers across the codebase keep working untouched. */
export { db } from "@crackgate/database";
export type * from "@crackgate/database";
