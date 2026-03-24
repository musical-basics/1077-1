"use server";

import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

/**
 * Resolves the current Clerk session to the corresponding Prisma User row.
 * Returns `null` if there is no active session.
 * Throws if the Clerk user exists but has no matching DB row (webhook may not have fired yet).
 */
export async function getCurrentUser() {
  const clerk = await currentUser();
  if (!clerk) return null;

  const user = await prisma.user.findUnique({
    where: { clerkUserId: clerk.id },
    include: { payProfile: true },
  });

  if (!user) {
    throw new Error(
      `No database row found for Clerk user ${clerk.id}. ` +
        `The webhook may not have fired yet.`
    );
  }

  return user;
}
