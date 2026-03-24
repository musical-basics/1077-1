"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth, requireAdmin } from "@/lib/guards";
import { calculateTotalPayout } from "@/lib/calculate-payout";

// ── User-facing ──────────────────────────────────────────

/**
 * Submit a new WorkLog entry. The totalPayout is computed
 * automatically from the user's PayProfile.
 */
export async function submitWorkLog(data: {
  weekEnding: Date;
  hoursLogged?: number | null;
  airbnbCleans?: number | null;
  kitchenCleans?: number | null;
  dogWalks?: number | null;
  expensesTotal?: number | null;
  receiptUrls?: string[];
}) {
  const user = await requireAuth();

  // Fetch the user's PayProfile to compute payout
  const payProfile = await prisma.payProfile.findUnique({
    where: { userId: user.id },
  });

  if (!payProfile) {
    throw new Error(
      "No PayProfile found. An admin must configure your pay profile first."
    );
  }

  const totalPayout = calculateTotalPayout(data, payProfile);

  return prisma.workLog.create({
    data: {
      userId: user.id,
      weekEnding: data.weekEnding,
      hoursLogged: data.hoursLogged,
      airbnbCleans: data.airbnbCleans,
      kitchenCleans: data.kitchenCleans,
      dogWalks: data.dogWalks,
      expensesTotal: data.expensesTotal,
      receiptUrls: data.receiptUrls ?? [],
      totalPayout,
    },
  });
}

/**
 * Fetch the logged-in user's WorkLogs, optionally filtered
 * by the week-ending date.
 */
export async function getMyWorkLogs(weekEnding?: Date) {
  const user = await requireAuth();

  return prisma.workLog.findMany({
    where: {
      userId: user.id,
      ...(weekEnding ? { weekEnding } : {}),
    },
    orderBy: { submittedAt: "desc" },
  });
}

// ── Admin-facing ─────────────────────────────────────────

/**
 * Fetch any user's WorkLogs by their internal ID.
 */
export async function getWorkLogsByUserId(
  userId: string,
  weekEnding?: Date
) {
  await requireAdmin();

  return prisma.workLog.findMany({
    where: {
      userId,
      ...(weekEnding ? { weekEnding } : {}),
    },
    orderBy: { submittedAt: "desc" },
  });
}
