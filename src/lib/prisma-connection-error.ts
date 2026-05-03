import { Prisma } from "@prisma/client";

/** Prisma error codes that usually mean env / DB server / credentials, not bad app logic. */
const CONNECTION_LIKE_CODES = new Set([
  "P1000",
  "P1001",
  "P1002",
  "P1003",
  "P1010",
  "P1017",
]);

export function isPrismaConnectionLikeError(err: unknown): boolean {
  if (err instanceof Prisma.PrismaClientInitializationError) return true;
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    return CONNECTION_LIKE_CODES.has(err.code);
  }
  return false;
}
