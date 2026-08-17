import Razorpay from "razorpay";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

export const razorpayKeyId = process.env.RAZORPAY_KEY_ID || "";
export const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || "";

if (!razorpayKeyId || !razorpayKeySecret) {
  console.warn(
    "[SnapCut Backend Warning] Razorpay credentials (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET) are missing in environment variables.",
  );
}

export const razorpay =
  razorpayKeyId && razorpayKeySecret
    ? new Razorpay({
        key_id: razorpayKeyId,
        key_secret: razorpayKeySecret,
      })
    : null;

export default razorpay;
