"use server";

import { getCurrentUser } from "@/lib/auth";

/**
 * Ensures there is an authenticated user. Returns the user or throws.
 */
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized — you must be signed in.");
  }
  return user;
}

/**
 * Ensures the current user has the "admin" role. Returns the user or throws.
 */
export async function requireAdmin() {
  const user = await requireAuth();
  if (user.role !== "admin") {
    throw new Error("Forbidden — admin access required.");
  }
  return user;
}
