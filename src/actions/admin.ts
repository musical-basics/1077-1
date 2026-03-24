"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";

/**
 * List all users with their attached PayProfile.
 */
export async function listAllUsers() {
  await requireAdmin();

  return prisma.user.findMany({
    include: { payProfile: true },
    orderBy: { email: "asc" },
  });
}

/**
 * Get a summary of all WorkLogs for a given week,
 * including user names and payout totals.
 */
export async function getWeeklySummary(weekEnding: Date) {
  await requireAdmin();

  return prisma.workLog.findMany({
    where: { weekEnding },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
    orderBy: { submittedAt: "desc" },
  });
}
