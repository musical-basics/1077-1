import { describe, it, expect } from "vitest";
import {
  calculateTotalPayout,
  PayProfileInput,
  WorkLogInput,
} from "@/lib/calculate-payout";

// ─── Test Fixtures ───────────────────────────────────────

const HOURLY_PROFILE: PayProfileInput = {
  payType: "hourly",
  hourlyRate: 25,
};

const HOURLY_PROFILE_27: PayProfileInput = {
  payType: "hourly",
  hourlyRate: 27,
};

const TASK_PROFILE: PayProfileInput = {
  payType: "task",
  airbnbClean: 25,
  kitchenClean: 10,
  dogWalk: 15,
  weeklyStipend: 40,
};

const HYBRID_PROFILE: PayProfileInput = {
  payType: "hybrid",
  hourlyRate: 20,
  airbnbClean: 25,
  kitchenClean: 10,
  dogWalk: 15,
  weeklyStipend: 40,
};

// ─── Strictly Hourly Workers ─────────────────────────────

describe("Strictly hourly worker", () => {
  it("calculates payout for a standard 40-hour week at $25/hr", () => {
    const log: WorkLogInput = { hoursLogged: 40 };
    expect(calculateTotalPayout(log, HOURLY_PROFILE)).toBe(1000);
  });

  it("calculates payout at $27/hr for a 35-hour week", () => {
    const log: WorkLogInput = { hoursLogged: 35 };
    expect(calculateTotalPayout(log, HOURLY_PROFILE_27)).toBe(945);
  });

  it("returns 0 when zero hours are logged", () => {
    const log: WorkLogInput = { hoursLogged: 0 };
    expect(calculateTotalPayout(log, HOURLY_PROFILE)).toBe(0);
  });

  it("handles partial hours (e.g. 8.5 hours)", () => {
    const log: WorkLogInput = { hoursLogged: 8.5 };
    expect(calculateTotalPayout(log, HOURLY_PROFILE)).toBe(212.5);
  });

  it("handles null hoursLogged gracefully (treats as 0)", () => {
    const log: WorkLogInput = { hoursLogged: null };
    expect(calculateTotalPayout(log, HOURLY_PROFILE)).toBe(0);
  });

  it("ignores task fields even if provided", () => {
    const log: WorkLogInput = {
      hoursLogged: 10,
      airbnbCleans: 5,
      kitchenCleans: 3,
    };
    // Hourly profile → only hours count
    expect(calculateTotalPayout(log, HOURLY_PROFILE)).toBe(250);
  });
});

// ─── Hybrid Worker (flat-rate tasks + weekly stipend) ────

describe("Hybrid worker (tasks + stipend + optional hours)", () => {
  it("calculates combined hourly + task payout", () => {
    const log: WorkLogInput = {
      hoursLogged: 10,
      airbnbCleans: 3,
      kitchenCleans: 2,
      dogWalks: 1,
    };
    // Hourly: 10 * $20 = $200
    // Tasks:  3*$25 + 2*$10 + 1*$15 + $40 stipend = $150
    // Total: $350
    expect(calculateTotalPayout(log, HYBRID_PROFILE)).toBe(350);
  });

  it("includes weekly stipend even with zero tasks and zero hours", () => {
    const log: WorkLogInput = {};
    // Hourly: 0 * $20 = $0
    // Tasks:  0 + 0 + 0 + $40 stipend = $40
    // Total: $40
    expect(calculateTotalPayout(log, HYBRID_PROFILE)).toBe(40);
  });

  it("handles a week with only hours and no tasks", () => {
    const log: WorkLogInput = { hoursLogged: 20 };
    // Hourly: 20 * $20 = $400
    // Tasks:  $40 stipend only
    // Total: $440
    expect(calculateTotalPayout(log, HYBRID_PROFILE)).toBe(440);
  });

  it("handles a week with only tasks and no hours", () => {
    const log: WorkLogInput = {
      airbnbCleans: 2,
      kitchenCleans: 1,
      dogWalks: 4,
    };
    // Hourly: 0
    // Tasks: 2*$25 + 1*$10 + 4*$15 + $40 = $160
    // Total: $160
    expect(calculateTotalPayout(log, HYBRID_PROFILE)).toBe(160);
  });
});

// ─── Task-Only Worker ────────────────────────────────────

describe("Task-only worker", () => {
  it("calculates payout from tasks + stipend", () => {
    const log: WorkLogInput = {
      airbnbCleans: 4,
      kitchenCleans: 3,
      dogWalks: 2,
    };
    // 4*$25 + 3*$10 + 2*$15 + $40 = $200
    expect(calculateTotalPayout(log, TASK_PROFILE)).toBe(200);
  });

  it("returns only the stipend when no tasks completed", () => {
    const log: WorkLogInput = {};
    expect(calculateTotalPayout(log, TASK_PROFILE)).toBe(40);
  });

  it("ignores hoursLogged for task-only profiles", () => {
    const log: WorkLogInput = {
      hoursLogged: 40,
      airbnbCleans: 1,
    };
    // Only task calc: 1*$25 + $40 = $65
    expect(calculateTotalPayout(log, TASK_PROFILE)).toBe(65);
  });
});

// ─── Expenses / Receipts on Top of Base Pay ──────────────

describe("Variable expenses added on top of base pay", () => {
  it("adds expenses to an hourly worker's payout", () => {
    const log: WorkLogInput = {
      hoursLogged: 20,
      expensesTotal: 75.5,
    };
    // Base: 20 * $25 = $500
    // Expenses: $75.50
    // Total: $575.50
    expect(calculateTotalPayout(log, HOURLY_PROFILE)).toBe(575.5);
  });

  it("adds expenses to a hybrid worker's payout", () => {
    const log: WorkLogInput = {
      hoursLogged: 10,
      airbnbCleans: 2,
      expensesTotal: 120,
    };
    // Hourly: 10 * $20 = $200
    // Tasks:  2*$25 + $40 stipend = $90
    // Expenses: $120
    // Total: $410
    expect(calculateTotalPayout(log, HYBRID_PROFILE)).toBe(410);
  });

  it("adds expenses to a task-only worker's payout", () => {
    const log: WorkLogInput = {
      kitchenCleans: 5,
      expensesTotal: 45.99,
    };
    // Tasks: 5*$10 + $40 = $90
    // Expenses: $45.99
    // Total: $135.99
    expect(calculateTotalPayout(log, TASK_PROFILE)).toBe(135.99);
  });

  it("handles zero expenses gracefully", () => {
    const log: WorkLogInput = {
      hoursLogged: 10,
      expensesTotal: 0,
    };
    expect(calculateTotalPayout(log, HOURLY_PROFILE)).toBe(250);
  });

  it("handles null expenses gracefully (treats as 0)", () => {
    const log: WorkLogInput = {
      hoursLogged: 10,
      expensesTotal: null,
    };
    expect(calculateTotalPayout(log, HOURLY_PROFILE)).toBe(250);
  });
});

// ─── Edge Cases ──────────────────────────────────────────

describe("Edge cases", () => {
  it("throws on unknown payType", () => {
    const log: WorkLogInput = { hoursLogged: 10 };
    const badProfile: PayProfileInput = { payType: "unknown" };
    expect(() => calculateTotalPayout(log, badProfile)).toThrow(
      'Unknown payType: "unknown"'
    );
  });

  it("handles a profile with all null optional rates", () => {
    const profile: PayProfileInput = {
      payType: "hybrid",
      hourlyRate: null,
      airbnbClean: null,
      kitchenClean: null,
      dogWalk: null,
      weeklyStipend: null,
    };
    const log: WorkLogInput = {
      hoursLogged: 40,
      airbnbCleans: 5,
      kitchenCleans: 3,
      dogWalks: 2,
      expensesTotal: 100,
    };
    // All rates are null → base is 0, only expenses
    expect(calculateTotalPayout(log, profile)).toBe(100);
  });

  it("handles large numbers without precision issues", () => {
    const profile: PayProfileInput = {
      payType: "hourly",
      hourlyRate: 150,
    };
    const log: WorkLogInput = {
      hoursLogged: 60,
      expensesTotal: 5000,
    };
    expect(calculateTotalPayout(log, profile)).toBe(14000);
  });
});
