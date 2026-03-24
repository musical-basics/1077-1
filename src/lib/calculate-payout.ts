/**
 * Pure calculation function — no DB dependency.
 * Computes the total payout for a single WorkLog entry
 * given the worker's PayProfile configuration.
 */

export interface PayProfileInput {
  payType: string; // "hourly" | "task" | "hybrid"
  hourlyRate?: number | null;
  airbnbClean?: number | null;
  kitchenClean?: number | null;
  dogWalk?: number | null;
  weeklyStipend?: number | null;
}

export interface WorkLogInput {
  hoursLogged?: number | null;
  airbnbCleans?: number | null;
  kitchenCleans?: number | null;
  dogWalks?: number | null;
  expensesTotal?: number | null;
}

/**
 * Calculate the total payout for a WorkLog entry.
 *
 * - **hourly**: hoursLogged × hourlyRate
 * - **task**: (airbnbCleans × airbnbClean) + (kitchenCleans × kitchenClean) +
 *             (dogWalks × dogWalk) + weeklyStipend
 * - **hybrid**: sum of both hourly and task components
 *
 * `expensesTotal` is always added on top of the base pay.
 */
export function calculateTotalPayout(
  workLog: WorkLogInput,
  payProfile: PayProfileInput
): number {
  let basePay = 0;

  const hourlyComponent =
    (workLog.hoursLogged ?? 0) * (payProfile.hourlyRate ?? 0);

  const taskComponent =
    (workLog.airbnbCleans ?? 0) * (payProfile.airbnbClean ?? 0) +
    (workLog.kitchenCleans ?? 0) * (payProfile.kitchenClean ?? 0) +
    (workLog.dogWalks ?? 0) * (payProfile.dogWalk ?? 0) +
    (payProfile.weeklyStipend ?? 0);

  switch (payProfile.payType) {
    case "hourly":
      basePay = hourlyComponent;
      break;
    case "task":
      basePay = taskComponent;
      break;
    case "hybrid":
      basePay = hourlyComponent + taskComponent;
      break;
    default:
      throw new Error(`Unknown payType: "${payProfile.payType}"`);
  }

  const expenses = workLog.expensesTotal ?? 0;
  return basePay + expenses;
}
