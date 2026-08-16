import multer from "multer";
import path from "path";

// In-memory storage for uploaded file buffers
const storage = multer.memoryStorage();

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

const fileFilter = (req, file, cb) => {
  if (!file || !file.originalname || !file.mimetype) {
    return cb(new Error("Malformed file upload request."), false);
  }

  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype.toLowerCase();

  if (ALLOWED_MIME_TYPES.has(mime) && ALLOWED_EXTENSIONS.has(ext)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file format. Only PNG, JPG, JPEG, and WEBP image files are allowed.",
      ),
      false,
    );
  }
};

const rawMulterUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB limit
    files: 1,
  },
}).single("image");

/**
 * Express middleware wrapper around Multer single image upload.
 * Catches Multer limits and format errors, returning sanitized 400 Bad Request JSON.
 */
export function uploadSingleImage(req, res, next) {
  rawMulterUpload(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            success: false,
            error: "File size exceeds the 10MB limit. Please upload a smaller image.",
          });
        }
        return res.status(400).json({
          success: false,
          error: `File upload error: ${err.message}`,
        });
      }
      return res.status(400).json({
        success: false,
        error: err.message || "Invalid image upload request.",
      });
    }
    next();
  });
}
