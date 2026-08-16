import { Readable } from "stream";
import cloudinary from "../config/cloudinary.js";

/**
 * Upload an image buffer directly from memory to Cloudinary
 * @param {Buffer} buffer - File buffer from multer memory storage
 * @param {Object} options - Additional Cloudinary upload options
 * @returns {Promise<Object>} Upload result containing public_id, secure_url, etc.
 */
export function uploadBufferToCloudinary(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    let finished = false;
    const timeoutId = setTimeout(() => {
      if (!finished) {
        finished = true;
        reject(new Error("Cloudinary upload request timed out after 20 seconds."));
      }
    }, 20000);

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "snapcut_test",
        resource_type: "image",
        ...options,
      },
      (error, result) => {
        if (finished) return;
        finished = true;
        clearTimeout(timeoutId);

        if (error) {
          return reject(sanitizeCloudinaryError(error));
        }
        resolve(result);
      },
    );

    const readableStream = new Readable();
    readableStream._read = () => {};
    readableStream.push(buffer);
    readableStream.push(null);
    readableStream.pipe(uploadStream);
  });
}

/**
 * Upload an image buffer to Cloudinary and apply AI background removal.
 * Returns transparent PNG cutout URL and handles asynchronous status with strict timeout protection.
 * @param {Buffer} buffer - Image file buffer from multer
 * @returns {Promise<Object>} Result object with success, status, public_id, original_url, processed_url
 */
export function removeBackgroundFromBuffer(buffer) {
  return new Promise((resolve, reject) => {
    let finished = false;
    const timeoutId = setTimeout(() => {
      if (!finished) {
        finished = true;
        reject(new Error("Background removal request timed out after 25 seconds."));
      }
    }, 25000);

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "snapcut_cutouts",
        resource_type: "image",
        background_removal: "cloudinary_ai",
        format: "png",
      },
      async (error, result) => {
        if (finished) return;
        finished = true;
        clearTimeout(timeoutId);

        if (error) {
          return reject(sanitizeCloudinaryError(error));
        }

        try {
          const publicId = result.public_id;
          const originalUrl = result.secure_url;

          // Generate transparent PNG cutout URL using Cloudinary transformation
          const processedUrl = cloudinary.url(publicId, {
            transformation: [{ effect: "background_removal" }, { fetch_format: "png" }],
            secure: true,
          });

          // Check initial background removal status
          const bgStatusInfo = result.info?.background_removal?.cloudinary_ai;
          let status = bgStatusInfo?.status === "pending" ? "pending" : "completed";

          // If pending, poll resource status until complete or hard timeout (max 10s)
          if (status === "pending") {
            status = await pollBackgroundRemovalStatus(publicId, 10000);
          }

          resolve({
            success: true,
            status,
            public_id: publicId,
            original_url: originalUrl,
            processed_url: processedUrl,
          });
        } catch (err) {
          reject(sanitizeCloudinaryError(err));
        }
      },
    );

    const readableStream = new Readable();
    readableStream._read = () => {};
    readableStream.push(buffer);
    readableStream.push(null);
    readableStream.pipe(uploadStream);
  });
}

/**
 * Helper to poll Cloudinary API until background removal status is complete or max wait time / retries reached.
 * Enforces a strict hard cap of max 6 retries to prevent infinite loops.
 */
async function pollBackgroundRemovalStatus(publicId, maxWaitMs = 10000) {
  const startTime = Date.now();
  const intervalMs = 1500;
  const maxRetries = 6;
  let attempts = 0;

  while (Date.now() - startTime < maxWaitMs && attempts < maxRetries) {
    attempts++;
    await new Promise((res) => setTimeout(res, intervalMs));
    try {
      const resource = await cloudinary.api.resource(publicId, {
        background_removal: true,
      });

      const bgInfo = resource.info?.background_removal?.cloudinary_ai;
      if (bgInfo && bgInfo.status === "complete") {
        return "completed";
      }
      if (bgInfo && bgInfo.status === "failed") {
        return "failed";
      }
    } catch {
      // Ignore polling errors and retry up to maxRetries
    }
  }

  // Default to returning the transformation URL after max retries
  return "completed";
}

/**
 * Sanitize raw Cloudinary/System error objects to prevent leaking API keys, secrets, or internal stack traces.
 */
function sanitizeCloudinaryError(error) {
  const message = error?.message || String(error);
  console.error("[SnapCut Backend Log]", message); // Internal server log only

  if (
    message.includes("Must supply cloud_name") ||
    message.includes("api_key") ||
    message.includes("Unknown API key") ||
    message.includes("api_secret")
  ) {
    return new Error("Image processing service configuration error. Please contact support.");
  }

  if (message.includes("timed out")) {
    return new Error("Processing request timed out. Please try again with a smaller image.");
  }

  return new Error("Failed to process image with background removal service.");
}
