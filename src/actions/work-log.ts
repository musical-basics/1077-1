"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth, requireAdmin } from "@/lib/guards";
import { calculateTotalPayout } from "@/lib/calculate-payout";

// ── Types ────────────────────────────────────────────────

export interface WorkLog {
  id: string;
  userId: string;
  weekEnding: Date;
  hoursLogged: number | null;
  airbnbCleans: number | null;
  kitchenCleans: number | null;
  dogWalks: number | null;
  expensesTotal: number | null;
  receiptUrls: string[];
  totalPayout: number;
  submittedAt: Date;
}

// ── User-facing ──────────────────────────────────────────

/**
 * Submit a new WorkLog entry. The totalPayout is computed
 * automatically from the user's PayProfile.
 *
 * Returns { success, payout } for the frontend form.
 */
export async function submitWorkLog(data: {
  weekEnding: Date | string;
  hoursLogged?: number | null;
  airbnbCleans?: number | null;
  kitchenCleans?: number | null;
  dogWalks?: number | null;
  expensesTotal?: number | null;
  receiptUrls?: string[];
}): Promise<{ success: boolean; payout: number }> {
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

  const weekDate =
    typeof data.weekEnding === "string"
      ? new Date(data.weekEnding)
      : data.weekEnding;

  const workLog = await prisma.workLog.create({
    data: {
      userId: user.id,
      weekEnding: weekDate,
      hoursLogged: data.hoursLogged,
      airbnbCleans: data.airbnbCleans,
      kitchenCleans: data.kitchenCleans,
      dogWalks: data.dogWalks,
      expensesTotal: data.expensesTotal,
      receiptUrls: data.receiptUrls ?? [],
      totalPayout,
    },
  });

  return { success: true, payout: workLog.totalPayout };
}

/**
 * Fetch the logged-in user's WorkLogs, optionally filtered
 * by the week-ending date.
 */
export async function getMyWorkLogs(weekEnding?: Date | string) {
  const user = await requireAuth();

  const weekDate =
    weekEnding == null
      ? undefined
      : typeof weekEnding === "string"
        ? new Date(weekEnding)
        : weekEnding;

  return prisma.workLog.findMany({
    where: {
      userId: user.id,
      ...(weekDate ? { weekEnding: weekDate } : {}),
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
  weekEnding?: Date | string
) {
  await requireAdmin();

  const weekDate =
    weekEnding == null
      ? undefined
      : typeof weekEnding === "string"
        ? new Date(weekEnding)
        : weekEnding;

  return prisma.workLog.findMany({
    where: {
      userId,
      ...(weekDate ? { weekEnding: weekDate } : {}),
    },
    orderBy: { submittedAt: "desc" },
  });
}
