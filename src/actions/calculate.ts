"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";
import { calculateTotalPayout } from "@/lib/calculate-payout";

/**
 * Calculate the full weekly payout breakdown for a user.
 * Fetches all WorkLogs for the given user + week, joins
 * against their PayProfile, and returns a line-item breakdown.
 */
export async function calculateWeeklyPayout(
  userId: string,
  weekEnding: Date
) {
  await requireAdmin();

  const payProfile = await prisma.payProfile.findUnique({
    where: { userId },
  });

  if (!payProfile) {
    throw new Error(`No PayProfile found for user ${userId}`);
  }

  const workLogs = await prisma.workLog.findMany({
    where: { userId, weekEnding },
  });

  const entries = workLogs.map((log: { id: string; submittedAt: Date; hoursLogged: number | null; airbnbCleans: number | null; kitchenCleans: number | null; dogWalks: number | null; expensesTotal: number | null }) => ({
    workLogId: log.id,
    submittedAt: log.submittedAt,
    payout: calculateTotalPayout(log, payProfile),
  }));

  const grandTotal = entries.reduce((sum: number, e: { payout: number }) => sum + e.payout, 0);

  return {
    userId,
    weekEnding,
    payType: payProfile.payType,
    entries,
    grandTotal,
  };
}
