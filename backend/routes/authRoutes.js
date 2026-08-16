import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

/**
 * GET /api/auth/me
 * Temporary protected test endpoint verifying server-side Supabase JWT authentication.
 */
router.get("/auth/me", requireAuth, (req, res) => {
  return res.status(200).json({
    success: true,
    user: {
      id: req.user.id,
      email: req.user.email,
    },
  });
});

export default router;
