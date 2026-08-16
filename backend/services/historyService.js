import { supabase } from "../config/supabase.js";

/**
 * Creates a processing history record for the authenticated user upon successful cutout.
 * @param {Object} params
 * @param {string} params.userId - Authenticated user UUID
 * @param {string} params.originalUrl - Original image URL
 * @param {string} params.processedUrl - Cutout transparent PNG URL
 * @param {string} [params.status="completed"] - Processing status
 * @returns {Promise<{ success: boolean, data?: object, error?: string }>}
 */
export async function createHistoryRecord({
  userId,
  originalUrl,
  processedUrl,
  status = "completed",
}) {
  if (!supabase || !userId) {
    return { success: false, error: "Database configuration unavailable" };
  }

  try {
    const { data, error } = await supabase
      .from("processing_history")
      .insert({
        user_id: userId,
        original_url: originalUrl,
        processed_url: processedUrl,
        status,
      })
      .select()
      .single();

    if (error) {
      console.error("[Create History Record Error]", error.message);
      return { success: false, error: "Failed to record processing history" };
    }

    return { success: true, data };
  } catch (err) {
    console.error("[Create History Record Exception]", err);
    return { success: false, error: "An error occurred while recording history" };
  }
}

/**
 * Retrieves processing history records for the given authenticated user ordered newest first.
 * @param {string} userId - Authenticated user UUID
 * @returns {Promise<{ success: boolean, history?: array, error?: string }>}
 */
export async function getUserHistory(userId) {
  if (!supabase || !userId) {
    return { success: false, error: "Database configuration unavailable" };
  }

  try {
    const { data, error } = await supabase
      .from("processing_history")
      .select("id, original_url, processed_url, status, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[Get User History Error]", error.message);
      return { success: false, error: "Failed to retrieve history" };
    }

    return { success: true, history: data || [] };
  } catch (err) {
    console.error("[Get User History Exception]", err);
    return { success: false, error: "An error occurred while fetching history" };
  }
}
