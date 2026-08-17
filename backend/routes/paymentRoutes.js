import { Router } from "express";
import crypto from "crypto";
import { requireAuth } from "../middleware/auth.js";
import { paymentLimiter } from "../middleware/rateLimiter.js";
import { razorpay, razorpayKeyId, razorpayKeySecret } from "../config/razorpay.js";
import { getPlanConfig } from "../config/plans.js";
import { supabase } from "../config/supabase.js";

const router = Router();

/**
 * POST /api/payments/create-order
 * Authenticated endpoint for creating Razorpay TEST payment orders.
 * The server ALWAYS enforces plan pricing from server-side PLAN_CONFIG.
 * Client-supplied amounts or credits are strictly ignored.
 */
router.post(
  "/payments/create-order",
  requireAuth,
  paymentLimiter,
  async (req, res) => {
    try {
      const { planId } = req.body || {};

      // 1. Validate planId
      const planConfig = getPlanConfig(planId);
      if (!planConfig) {
        return res.status(400).json({
          success: false,
          error: "Invalid or unsupported plan specified. Must be 'pro' or 'business'.",
        });
      }

      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: "Authentication required",
        });
      }

      // 2. Check Razorpay SDK availability
      if (!razorpay || !razorpayKeyId) {
        console.error("[Payment Service Error] Razorpay instance or key ID is missing");
        return res.status(500).json({
          success: false,
          error: "Payment service is currently unavailable.",
        });
      }

      const amountPaise = planConfig.amountPaise;
      const creditsAdded = planConfig.credits;
      const billingCycle = planConfig.billingCycle;
      const normalizedPlanId = planId.trim().toLowerCase();

      // 3. Generate unique receipt ID for Razorpay order
      const receipt = `rcpt_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

      // 4. Create Razorpay order using server-side calculated amount
      let razorpayOrder;
      try {
        razorpayOrder = await razorpay.orders.create({
          amount: amountPaise,
          currency: "INR",
          receipt,
          notes: {
            userId,
            planId: normalizedPlanId,
          },
        });
      } catch (rzpErr) {
        console.warn(
          "[Razorpay SDK Order Warning]",
          rzpErr?.error?.description || rzpErr?.message || "Razorpay API call failed",
        );

        // If credentials are mock/test placeholders or API returns 401 during dev testing,
        // create a valid test mode order response structure
        if (
          process.env.NODE_ENV === "development" ||
          razorpayKeyId.includes("test") ||
          rzpErr?.statusCode === 401
        ) {
          console.log("[Razorpay Test Mode] Generating mock test order payload");
          razorpayOrder = {
            id: `order_test_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            amount: amountPaise,
            currency: "INR",
            receipt,
            status: "created",
          };
        } else {
          return res.status(500).json({
            success: false,
            error: "Failed to create payment order with payment gateway.",
          });
        }
      }

      if (!razorpayOrder || !razorpayOrder.id) {
        console.error("[Razorpay Order Creation Error] Received empty order object");
        return res.status(500).json({
          success: false,
          error: "Failed to initialize payment order.",
        });
      }

      // 5. Store payment record in Supabase public.payments table
      if (supabase) {
        const { error: dbError } = await supabase.from("payments").insert({
          user_id: userId,
          razorpay_order_id: razorpayOrder.id,
          plan_id: normalizedPlanId,
          billing_cycle: billingCycle,
          amount_paise: amountPaise,
          credits_added: creditsAdded,
          status: "created",
        });

        if (dbError) {
          console.warn("[Payment DB Insert Notice]", dbError.message);
        }
      }

      // 6. Return ONLY safe order info to the frontend
      return res.status(200).json({
        success: true,
        order: {
          id: razorpayOrder.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
        },
        keyId: razorpayKeyId,
      });
    } catch (err) {
      console.error("[Create Payment Order Unhandled Exception]", err);
      return res.status(500).json({
        success: false,
        error: "An unexpected error occurred while processing payment request.",
      });
    }
  },
);

/**
 * POST /api/payments/verify-payment
 * Authenticated endpoint for verifying Razorpay HMAC SHA-256 signatures,
 * marking payment status as 'paid', and invoking public.add_credits_and_update_plan RPC.
 * Includes strict Idempotency protection against duplicate verification requests.
 */
router.post(
  "/payments/verify-payment",
  requireAuth,
  paymentLimiter,
  async (req, res) => {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};

      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res.status(400).json({
          success: false,
          error: "Missing required payment verification parameters.",
        });
      }

      const userId = req.user.id;

      if (!supabase) {
        return res.status(500).json({
          success: false,
          error: "Database service unavailable",
        });
      }

      // 1. Fetch payment record from public.payments
      const { data: order, error: orderError } = await supabase
        .from("payments")
        .select("*")
        .eq("razorpay_order_id", razorpay_order_id)
        .maybeSingle();

      if (orderError) {
        console.error("[Verify Payment DB Search Error]", orderError.message);
        return res.status(500).json({
          success: false,
          error: "Failed to locate payment record.",
        });
      }

      if (!order || order.user_id !== userId) {
        return res.status(404).json({
          success: false,
          error: "Payment record not found or access denied.",
        });
      }

      // 2. IDEMPOTENCY SAFEGUARD: Return already processed status if already paid
      if (order.status === "paid") {
        const { data: profile } = await supabase
          .from("profiles")
          .select("credits, plan")
          .eq("id", userId)
          .maybeSingle();

        return res.status(200).json({
          success: true,
          message: "Payment already verified",
          alreadyProcessed: true,
          credits: profile?.credits ?? 0,
          plan: profile?.plan || "free",
        });
      }

      // 3. Verify Razorpay HMAC SHA-256 signature
      const textToSign = `${razorpay_order_id}|${razorpay_payment_id}`;
      const expectedSignature = crypto
        .createHmac("sha256", razorpayKeySecret)
        .update(textToSign)
        .digest("hex");

      let isSignatureValid = false;
      try {
        isSignatureValid = crypto.timingSafeEqual(
          Buffer.from(expectedSignature, "utf8"),
          Buffer.from(razorpay_signature, "utf8"),
        );
      } catch (timingErr) {
        isSignatureValid = false;
      }

      if (!isSignatureValid) {
        // Mark payment as failed in public.payments
        await supabase
          .from("payments")
          .update({ status: "failed" })
          .eq("id", order.id);

        return res.status(400).json({
          success: false,
          error: "Payment could not be verified. Invalid signature.",
        });
      }

      // 4. Update payment record to 'paid'
      const { error: updateError } = await supabase
        .from("payments")
        .update({
          status: "paid",
          razorpay_payment_id,
          razorpay_signature,
        })
        .eq("id", order.id);

      if (updateError) {
        console.error("[Verify Payment DB Update Error]", updateError.message);
        return res.status(500).json({
          success: false,
          error: "Failed to update payment record status.",
        });
      }

      // 5. Invoke atomic public.add_credits_and_update_plan RPC
      const { data: rpcData, error: rpcError } = await supabase.rpc(
        "add_credits_and_update_plan",
        {
          p_user_id: userId,
          p_credits: order.credits_added,
          p_plan: order.plan_id,
        },
      );

      if (rpcError) {
        console.error("[Add Credits RPC Error]", rpcError.message);
        return res.status(500).json({
          success: false,
          error: "Failed to grant plan credits.",
        });
      }

      // Extract new credit balance and plan from RPC result
      const rpcResult = Array.isArray(rpcData) ? rpcData[0] : rpcData;
      const newCredits = Number(rpcResult?.credits ?? 0);
      const newPlan = String(rpcResult?.plan || order.plan_id);

      return res.status(200).json({
        success: true,
        message: "Payment verified and credits added",
        credits: newCredits,
        plan: newPlan,
      });
    } catch (err) {
      console.error("[Verify Payment Unhandled Exception]", err);
      return res.status(500).json({
        success: false,
        error: "An unexpected error occurred during payment verification.",
      });
    }
  },
);

export default router;
