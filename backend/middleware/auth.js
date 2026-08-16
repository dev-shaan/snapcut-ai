import { supabase } from "../config/supabase.js";

/**
 * Reusable Express authentication middleware.
 * Verifies Supabase Bearer JWT token from Authorization header and attaches req.user.
 */
export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      error: "Authentication required",
    });
  }

  const token = authHeader.split(" ")[1];

  if (!token || !supabase) {
    return res.status(401).json({
      success: false,
      error: "Authentication required",
    });
  }

  try {
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    req.user = data.user;
    next();
  } catch (err) {
    console.error("[Auth Middleware Exception Log]", err);
    return res.status(401).json({
      success: false,
      error: "Authentication required",
    });
  }
}
