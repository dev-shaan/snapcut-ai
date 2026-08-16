import { Router } from "express";
import { supabase } from "../config/supabase.js";

const router = Router();

/**
 * GET /api/db-health
 * Safe database connectivity check querying Supabase.
 * Returns { success: true, message: "Database connection is working" } or safe error.
 */
router.get("/db-health", async (req, res) => {
  if (!supabase) {
    return res.status(500).json({
      success: false,
      error: "Database connection failed",
    });
  }

  try {
    const { error } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true });

    if (error) {
      console.error("[Supabase DB Health Error]", error.message);
      return res.status(500).json({
        success: false,
        error: "Database connection failed",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Database connection is working",
    });
  } catch (err) {
    console.error("[Supabase Connectivity Exception]", err);
    return res.status(500).json({
      success: false,
      error: "Database connection failed",
    });
  }
});

export default router;
