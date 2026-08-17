/**
 * Server-side pricing configuration for SnapCut AI.
 * The backend ALWAYS determines amount and credits from planId.
 * Never trust amount, credits, or price values supplied by the frontend.
 */
export const PLAN_CONFIG = {
  pro: {
    amountPaise: 9900,
    credits: 100,
    billingCycle: "monthly",
  },
  business: {
    amountPaise: 29900,
    credits: 500,
    billingCycle: "monthly",
  },
};

/**
 * Helper to retrieve server-side plan details by planId.
 * Returns null if planId is invalid or unsupported for payment orders.
 */
export function getPlanConfig(planId) {
  if (!planId || typeof planId !== "string") return null;
  const normalizedKey = planId.trim().toLowerCase();
  return PLAN_CONFIG[normalizedKey] || null;
}
