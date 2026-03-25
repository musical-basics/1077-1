"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";
import { calculateTotalPayout } from "@/lib/calculate-payout";

// ── Types ────────────────────────────────────────────────

export interface PayoutBreakdown {
  userId: string;
  weekEnding: string;
  payType: string;
  entries: {
    workLogId: string;
    submittedAt: Date;
    payout: number;
  }[];
  grandTotal: number;
  breakdown: {
    label: string;
    quantity: number;
    rate: number;
    subtotal: number;
  }[];
  totalPayout: number;
}

/**
 * Calculate the full weekly payout breakdown for a user.
 * Fetches all WorkLogs for the given user + week, joins
 * against their PayProfile, and returns a line-item breakdown.
 */
export async function calculateWeeklyPayout(
  userId: string,
  weekEnding: Date | string
): Promise<PayoutBreakdown> {
  await requireAdmin();

  const weekDate =
    typeof weekEnding === "string" ? new Date(weekEnding) : weekEnding;
  const weekStr =
    typeof weekEnding === "string"
      ? weekEnding
      : weekEnding.toISOString().split("T")[0];

  const payProfile = await prisma.payProfile.findUnique({
    where: { userId },
  });

  if (!payProfile) {
    throw new Error(`No PayProfile found for user ${userId}`);
  }

  const workLogs = await prisma.workLog.findMany({
    where: { userId, weekEnding: weekDate },
  });

  const entries = workLogs.map(
    (log: {
      id: string;
      submittedAt: Date;
      hoursLogged: number | null;
      airbnbCleans: number | null;
      kitchenCleans: number | null;
      dogWalks: number | null;
      expensesTotal: number | null;
    }) => ({
      workLogId: log.id,
      submittedAt: log.submittedAt,
      payout: calculateTotalPayout(log, payProfile),
    })
  );

  const grandTotal = entries.reduce(
    (sum: number, e: { payout: number }) => sum + e.payout,
    0
  );

  // Build line-item breakdown from aggregated work log data
  const totalHours = workLogs.reduce(
    (s: number, l: { hoursLogged: number | null }) =>
      s + (l.hoursLogged ?? 0),
    0
  );
  const totalAirbnb = workLogs.reduce(
    (s: number, l: { airbnbCleans: number | null }) =>
      s + (l.airbnbCleans ?? 0),
    0
  );
  const totalKitchen = workLogs.reduce(
    (s: number, l: { kitchenCleans: number | null }) =>
      s + (l.kitchenCleans ?? 0),
    0
  );
  const totalDogWalks = workLogs.reduce(
    (s: number, l: { dogWalks: number | null }) => s + (l.dogWalks ?? 0),
    0
  );
  const totalExpenses = workLogs.reduce(
    (s: number, l: { expensesTotal: number | null }) =>
      s + (l.expensesTotal ?? 0),
    0
  );

  const breakdown: PayoutBreakdown["breakdown"] = [];

  if (
    (payProfile.payType === "hourly" || payProfile.payType === "hybrid") &&
    payProfile.hourlyRate
  ) {
    breakdown.push({
      label: "Hourly Work",
      quantity: totalHours,
      rate: payProfile.hourlyRate,
      subtotal: totalHours * payProfile.hourlyRate,
    });
  }

  if (payProfile.payType === "task" || payProfile.payType === "hybrid") {
    if (payProfile.airbnbClean && totalAirbnb > 0) {
      breakdown.push({
        label: "Airbnb Cleans",
        quantity: totalAirbnb,
        rate: payProfile.airbnbClean,
        subtotal: totalAirbnb * payProfile.airbnbClean,
      });
    }
    if (payProfile.kitchenClean && totalKitchen > 0) {
      breakdown.push({
        label: "Kitchen Cleans",
        quantity: totalKitchen,
        rate: payProfile.kitchenClean,
        subtotal: totalKitchen * payProfile.kitchenClean,
      });
    }
    if (payProfile.dogWalk && totalDogWalks > 0) {
      breakdown.push({
        label: "Dog Walks",
        quantity: totalDogWalks,
        rate: payProfile.dogWalk,
        subtotal: totalDogWalks * payProfile.dogWalk,
      });
    }
  }

  if (totalExpenses > 0) {
    breakdown.push({
      label: "Expenses",
      quantity: 1,
      rate: totalExpenses,
      subtotal: totalExpenses,
    });
  }

  if (payProfile.weeklyStipend) {
    breakdown.push({
      label: "Weekly Stipend",
      quantity: 1,
      rate: payProfile.weeklyStipend,
      subtotal: payProfile.weeklyStipend,
    });
  }

  return {
    userId,
    weekEnding: weekStr,
    payType: payProfile.payType,
    entries,
    grandTotal,
    breakdown,
    totalPayout: grandTotal,
  };
}
