"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin, requireAuth } from "@/lib/guards";
import { getCurrentUser } from "@/lib/auth";

// Re-export for pages that import from @/actions/admin
export { getCurrentUser };

// ── Types ────────────────────────────────────────────────

export interface WeeklySummary {
  user: {
    id: string;
    name: string | null;
    email: string;
  };
  totalHours: number;
  totalTasks: number;
  totalExpenses: number;
  totalPayout: number;
}

// ── User-facing ──────────────────────────────────────────

/**
 * Check if the current user is an admin.
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const user = await getCurrentUser();
    return user?.role === "admin";
  } catch {
    return false;
  }
}

// ── Admin-facing ─────────────────────────────────────────

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
 * Fetch a single user by their internal ID.
 */
export async function getUserById(userId: string) {
  await requireAdmin();

  return prisma.user.findUnique({
    where: { id: userId },
    include: { payProfile: true },
  });
}

/**
 * Get a summary of all WorkLogs for a given week,
 * including user names and payout totals.
 */
export async function getWeeklySummary(weekEnding: Date | string) {
  await requireAdmin();

  const weekDate =
    typeof weekEnding === "string" ? new Date(weekEnding) : weekEnding;

  return prisma.workLog.findMany({
    where: { weekEnding: weekDate },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
    orderBy: { submittedAt: "desc" },
  });
}

/**
 * Get aggregated weekly payroll summary per user.
 * Returns one row per user who has work logs for the given week.
 */
export async function getWeeklyPayrollSummary(
  weekEnding: string
): Promise<WeeklySummary[]> {
  await requireAdmin();

  const weekDate = new Date(weekEnding);

  const workLogs = await prisma.workLog.findMany({
    where: { weekEnding: weekDate },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  // Aggregate per user
  const userMap = new Map<string, WeeklySummary>();

  for (const log of workLogs) {
    const existing = userMap.get(log.userId);
    const tasks =
      (log.airbnbCleans ?? 0) +
      (log.kitchenCleans ?? 0) +
      (log.dogWalks ?? 0);

    if (existing) {
      existing.totalHours += log.hoursLogged ?? 0;
      existing.totalTasks += tasks;
      existing.totalExpenses += log.expensesTotal ?? 0;
      existing.totalPayout += log.totalPayout;
    } else {
      userMap.set(log.userId, {
        user: log.user,
        totalHours: log.hoursLogged ?? 0,
        totalTasks: tasks,
        totalExpenses: log.expensesTotal ?? 0,
        totalPayout: log.totalPayout,
      });
    }
  }

  return Array.from(userMap.values());
}

/**
 * Pre-register a new team member by creating their User row.
 * When they sign up via Clerk, JIT provisioning will match them by email.
 */
export async function addTeamMember(data: {
  email: string;
  name: string | null;
  role: string;
}) {
  await requireAdmin();

  // Check for duplicate email
  const existing = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existing) {
    throw new Error(`A team member with email ${data.email} already exists.`);
  }

  return prisma.user.create({
    data: {
      clerkUserId: `pending_${Date.now()}`,
      email: data.email,
      name: data.name,
      role: data.role,
    },
  });
}

/**
 * Dev convenience: Update the current user's role.
 * Used by the landing page role-switching buttons.
 */
export async function updateMyRole(role: string) {
  const user = await requireAuth();

  if (role !== "admin" && role !== "assistant") {
    throw new Error("Invalid role");
  }

  return prisma.user.update({
    where: { id: user.id },
    data: { role },
  });
}
