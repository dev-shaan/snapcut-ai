import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { supabase } from "../config/supabase.js";

const router = Router();

/**
 * GET /api/credits
 * Authenticated endpoint returning user credit balance & plan from public.profiles table.
 */
router.get("/credits", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    if (!supabase) {
      return res.status(500).json({
        success: false,
        error: "Database service unavailable",
      });
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("credits, plan")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error("[Get Credits Database Error]", error.message);
      return res.status(500).json({
        success: false,
        error: "Failed to retrieve user credits",
      });
    }

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: "User profile not found",
      });
    }

    if (profile.credits === null || profile.credits === undefined) {
      console.error("[Get Credits Data Integrity Error] Profile credits is null");
      return res.status(500).json({
        success: false,
        error: "Profile credit balance is unavailable",
      });
    }

    return res.status(200).json({
      success: true,
      credits: profile.credits,
      plan: profile.plan || "free",
    });
  } catch (err) {
    console.error("[Get Credits Unhandled Exception]", err);
    return res.status(500).json({
      success: false,
      error: "An unexpected error occurred",
    });
  }
});

export default router;
