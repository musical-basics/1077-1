"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/guards";
import { requireAdmin } from "@/lib/guards";

// ── User-facing ──────────────────────────────────────────

/**
 * Fetch the logged-in user's PayProfile.
 * The frontend uses this to decide whether to render
 * a time-clock UI or a task-checkbox UI.
 */
export async function getMyPayProfile() {
  const user = await requireAuth();

  return prisma.payProfile.findUnique({
    where: { userId: user.id },
  });
}

// ── Admin-facing ─────────────────────────────────────────

/**
 * Fetch any user's PayProfile by their internal ID.
 */
export async function getPayProfileByUserId(userId: string) {
  await requireAdmin();

  return prisma.payProfile.findUnique({
    where: { userId },
  });
}

/**
 * Create or update a user's PayProfile.
 */
export async function upsertPayProfile(data: {
  userId: string;
  payType: string;
  hourlyRate?: number | null;
  airbnbClean?: number | null;
  kitchenClean?: number | null;
  dogWalk?: number | null;
  weeklyStipend?: number | null;
}) {
  await requireAdmin();

  return prisma.payProfile.upsert({
    where: { userId: data.userId },
    create: data,
    update: data,
  });
}
