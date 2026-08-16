import { supabase } from "../config/supabase.js";

/**
 * Atomically reserves/deducts 1 credit for the given authenticated user via PostgreSQL RPC.
 * Relies strictly on public.deduct_credit(p_user_id) with zero direct update fallbacks.
 * @param {string} userId - Authenticated user UUID
 * @returns {Promise<{ success: boolean, remainingCredits?: number, error?: string, isServerError?: boolean }>}
 */
export async function reserveCreditAtomically(userId) {
  if (!supabase || !userId) {
    return {
      success: false,
      isServerError: true,
      error: "Credit service temporarily unavailable",
    };
  }

  try {
    // Invoke public.deduct_credit(p_user_id UUID) RPC function
    const { data: rpcData, error: rpcError } = await supabase.rpc("deduct_credit", {
      p_user_id: userId,
    });

    if (rpcError) {
      console.error("[Reserve Credit RPC Error]", rpcError.message, rpcError.code);
      return {
        success: false,
        isServerError: true,
        error: "Credit service temporarily unavailable",
      };
    }

    if (rpcData === null || rpcData === undefined) {
      console.error("[Reserve Credit RPC Error] RPC returned empty result");
      return {
        success: false,
        isServerError: true,
        error: "Credit service temporarily unavailable",
      };
    }

    // Handle table array response [{ success: boolean, remaining_credits: number }]
    const rpcResult = Array.isArray(rpcData) ? rpcData[0] : rpcData;

    if (!rpcResult || typeof rpcResult !== "object") {
      console.error("[Reserve Credit RPC Error] Unexpected RPC result shape:", rpcData);
      return {
        success: false,
        isServerError: true,
        error: "Credit service temporarily unavailable",
      };
    }

    if (!rpcResult.success) {
      return {
        success: false,
        isServerError: false,
        error: "Insufficient credits",
      };
    }

    return {
      success: true,
      remainingCredits: Number(rpcResult.remaining_credits ?? rpcResult.remainingCredits ?? 0),
    };
  } catch (err) {
    console.error("[Reserve Credit Unhandled Exception]", err);
    return {
      success: false,
      isServerError: true,
      error: "Credit service temporarily unavailable",
    };
  }
}

/**
 * Atomically refunds 1 credit to the given user if AI processing fails via PostgreSQL RPC.
 * @param {string} userId - Authenticated user UUID
 * @returns {Promise<boolean>}
 */
export async function refundCreditAtomically(userId) {
  if (!supabase || !userId) return false;

  try {
    const { data: rpcData, error: rpcError } = await supabase.rpc("refund_credit", {
      p_user_id: userId,
    });

    if (!rpcError && rpcData !== null && rpcData !== undefined) {
      return Boolean(rpcData);
    }

    return false;
  } catch (err) {
    console.error("[Refund Credit Exception]", err);
    return false;
  }
}
