"use server";

import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

/**
 * Resolves the current Clerk session to the corresponding Prisma User row.
 * Returns `null` if there is no active session.
 * Auto-creates the DB row if the Clerk user exists but hasn't been synced yet
 * (JIT provisioning — useful for local dev when the webhook isn't configured).
 */
export async function getCurrentUser() {
  const clerk = await currentUser();
  if (!clerk) return null;

  let user = await prisma.user.findUnique({
    where: { clerkUserId: clerk.id },
    include: { payProfile: true },
  });

  if (!user) {
    const email =
      clerk.emailAddresses?.[0]?.emailAddress ?? `${clerk.id}@placeholder`;
    const name =
      [clerk.firstName, clerk.lastName].filter(Boolean).join(" ") || null;

    user = await prisma.user.create({
      data: {
        clerkUserId: clerk.id,
        email,
        name,
        role: "assistant",
      },
      include: { payProfile: true },
    });

    console.log(`✅ JIT-provisioned DB user for Clerk user ${clerk.id}`);
  }

  return user;
}
