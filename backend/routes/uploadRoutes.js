import { Router } from "express";
import { uploadSingleImage } from "../middleware/upload.js";
import { apiLimiter } from "../middleware/rateLimiter.js";
import {
  uploadBufferToCloudinary,
  removeBackgroundFromBuffer,
} from "../services/cloudinaryService.js";

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

// AI Background Removal Route (with rate limiting and single image upload middleware)
router.post("/remove-background", apiLimiter, uploadSingleImage, async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: "No image file provided. Please upload an image under the field 'image'.",
    });
  }

  try {
    const result = await removeBackgroundFromBuffer(req.file.buffer);

    return res.status(200).json(result);
  } catch (removeErr) {
    const errorMessage =
      removeErr instanceof Error
        ? removeErr.message
        : "Failed to process AI background removal.";

    const isConfigError = errorMessage.includes("configuration error");

    return res.status(isConfigError ? 500 : 500).json({
      success: false,
      status: "failed",
      error: errorMessage,
    });
  }
});

export default router;
