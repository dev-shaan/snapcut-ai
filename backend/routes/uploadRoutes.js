import { Router } from "express";
import { uploadSingleImage } from "../middleware/upload.js";
import { apiLimiter } from "../middleware/rateLimiter.js";
import { requireAuth } from "../middleware/auth.js";
import {
  uploadBufferToCloudinary,
  removeBackgroundFromBuffer,
} from "../services/cloudinaryService.js";
import {
  reserveCreditAtomically,
  refundCreditAtomically,
} from "../services/creditService.js";
import { createHistoryRecord } from "../services/historyService.js";

const router = Router();

// Test Upload Route (with rate limiting and single image upload middleware)
router.post("/test-upload", apiLimiter, uploadSingleImage, async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: "No image file provided. Please upload an image under the field 'image'.",
    });
  }

  try {
    const result = await uploadBufferToCloudinary(req.file.buffer);

    return res.status(200).json({
      success: true,
      public_id: result.public_id,
      secure_url: result.secure_url,
    });
  } catch (uploadErr) {
    const errorMessage =
      uploadErr instanceof Error
        ? uploadErr.message
        : "Failed to process test image upload.";

    return res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
});

// Authenticated AI Background Removal Route
router.post(
  "/remove-background",
  requireAuth,
  apiLimiter,
  uploadSingleImage,
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No image file provided. Please upload an image under the field 'image'.",
      });
    }

    const userId = req.user.id;

    // Atomically reserve 1 credit BEFORE calling Cloudinary AI service
    const reservation = await reserveCreditAtomically(userId);

    if (!reservation.success) {
      if (reservation.isServerError) {
        return res.status(500).json({
          success: false,
          status: "failed",
          error: reservation.error || "Credit service temporarily unavailable",
        });
      }

      return res.status(403).json({
        success: false,
        status: "failed",
        error: "Insufficient credits. Please upgrade your plan to continue.",
      });
    }

    try {
      const result = await removeBackgroundFromBuffer(req.file.buffer);

      // Record successful background removal in public.processing_history
      await createHistoryRecord({
        userId,
        originalUrl: result.original_url,
        processedUrl: result.processed_url,
        status: "completed",
      });

      return res.status(200).json({
        ...result,
        remaining_credits: reservation.remainingCredits,
      });
    } catch (removeErr) {
      // Refund reserved credit if Cloudinary AI processing fails
      await refundCreditAtomically(userId);

      const errorMessage =
        removeErr instanceof Error
          ? removeErr.message
          : "Failed to process AI background removal.";

      return res.status(500).json({
        success: false,
        status: "failed",
        error: errorMessage,
      });
    }
  },
);

export default router;
