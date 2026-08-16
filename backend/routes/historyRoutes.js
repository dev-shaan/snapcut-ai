import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { getUserHistory } from "../services/historyService.js";

const router = Router();

/**
 * GET /api/history
 * Authenticated endpoint returning processing history records belonging ONLY to req.user.
 */
router.get("/history", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await getUserHistory(userId);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error || "Failed to fetch processing history",
      });
    }

    return res.status(200).json({
      success: true,
      history: result.history || [],
    });
  } catch (err) {
    console.error("[Get History Endpoint Exception]", err);
    return res.status(500).json({
      success: false,
      error: "An unexpected error occurred while fetching processing history",
    });
  }
});

export default router;
