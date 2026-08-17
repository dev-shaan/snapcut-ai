import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import crypto from "crypto";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

const API_BASE = "http://localhost:5000/api";
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "rzp_test_secret_key_12345";

if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SECRET_KEY in backend/.env");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY);

async function main() {
  console.log("==================================================");
  console.log("Starting Razorpay Verification Test Suite");
  console.log("==================================================\n");

  let testPassed = 0;
  let testFailed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      testPassed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      testFailed++;
    }
  }

  // Create temporary test user
  const testEmail = `test_verification_${Date.now()}@example.com`;
  const testPassword = "TestPassword123!";
  const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword,
  });

  if (signUpErr || !signUpData.session) {
    console.error("Failed to create test auth session:", signUpErr?.message);
    process.exit(1);
  }

  const authToken = signUpData.session.access_token;
  const userId = signUpData.user.id;

  // 1. Initial Credit Balance Check
  console.log("1. Checking Initial Credits...");
  const { data: initialProfile } = await supabase
    .from("profiles")
    .select("credits, plan")
    .eq("id", userId)
    .single();

  const initialCredits = initialProfile?.credits ?? 3;
  console.log(`Initial Credits: ${initialCredits}, Initial Plan: ${initialProfile?.plan || 'free'}`);

  // 2. Test 1: Pro Order Creation & Successful Verification
  console.log("\n2. Test 1: Pro Payment Order & Verification (+100 credits)...");
  let orderId = null;
  let paymentId = `pay_test_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  try {
    // Step A: Create Order
    const orderRes = await fetch(`${API_BASE}/payments/create-order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ planId: "pro" }),
    });
    const orderData = await orderRes.json();
    assert(orderRes.status === 200 && orderData.success === true, "Pro order created successfully");
    orderId = orderData.order.id;

    // Step B: Calculate Valid HMAC Signature
    const textToSign = `${orderId}|${paymentId}`;
    const validSignature = crypto
      .createHmac("sha256", RAZORPAY_KEY_SECRET)
      .update(textToSign)
      .digest("hex");

    // Step C: Verify Payment
    const verifyRes = await fetch(`${API_BASE}/payments/verify-payment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: validSignature,
      }),
    });
    const verifyData = await verifyRes.json();
    assert(verifyRes.status === 200 && verifyData.success === true, "Payment verified successfully");
    assert(verifyData.credits === initialCredits + 100, `Credits increased from ${initialCredits} to ${verifyData.credits} (+100 credits)`);
    assert(verifyData.plan === "pro", "Plan updated to 'pro'");

    // Check payment record status in DB
    const { data: dbPayment } = await supabase
      .from("payments")
      .select("status, razorpay_payment_id")
      .eq("razorpay_order_id", orderId)
      .single();

    assert(dbPayment?.status === "paid", "Payment database status updated to 'paid'");
    assert(dbPayment?.razorpay_payment_id === paymentId, "razorpay_payment_id recorded in database");
  } catch (err) {
    assert(false, `Test 1 failed: ${err.message}`);
  }

  // 3. Test 2: Idempotency Check (Repeat Verification Request)
  console.log("\n3. Test 2: Repeat Verification Request for Same Payment (Idempotency)...");
  try {
    const textToSign = `${orderId}|${paymentId}`;
    const validSignature = crypto
      .createHmac("sha256", RAZORPAY_KEY_SECRET)
      .update(textToSign)
      .digest("hex");

    const repeatRes = await fetch(`${API_BASE}/payments/verify-payment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: validSignature,
      }),
    });
    const repeatData = await repeatRes.json();

    assert(repeatRes.status === 200 && repeatData.success === true, "Repeat request returns 200 OK");
    assert(repeatData.alreadyProcessed === true, "Response flags alreadyProcessed: true");
    assert(repeatData.credits === initialCredits + 100, `Credits NOT added twice (remains ${repeatData.credits})`);
  } catch (err) {
    assert(false, `Test 2 failed: ${err.message}`);
  }

  // 4. Test 3: Invalid Signature Rejection
  console.log("\n4. Test 3: Invalid Signature Rejection...");
  try {
    // Create new order
    const orderRes = await fetch(`${API_BASE}/payments/create-order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ planId: "business" }),
    });
    const orderData = await orderRes.json();
    const badOrderId = orderData.order.id;
    const badPaymentId = `pay_bad_${Date.now()}`;
    const invalidSignature = "invalid_signature_hash_1234567890abcdef";

    const verifyBadRes = await fetch(`${API_BASE}/payments/verify-payment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        razorpay_order_id: badOrderId,
        razorpay_payment_id: badPaymentId,
        razorpay_signature: invalidSignature,
      }),
    });
    const verifyBadData = await verifyBadRes.json();

    assert(verifyBadRes.status === 400, "Invalid signature request rejected with 400 Bad Request");
    assert(verifyBadData.success === false, "Response has success: false");

    // Check DB status marked failed
    const { data: dbBadPayment } = await supabase
      .from("payments")
      .select("status")
      .eq("razorpay_order_id", badOrderId)
      .single();

    assert(dbBadPayment?.status === "failed", "Payment database status set to 'failed'");
  } catch (err) {
    assert(false, `Test 3 failed: ${err.message}`);
  }

  // 5. Test 4: Refresh Persistence / GET /api/credits check
  console.log("\n5. Test 4: Refresh Profile / GET /api/credits Verification...");
  try {
    const credRes = await fetch(`${API_BASE}/credits`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const credData = await credRes.json();
    assert(credRes.status === 200 && credData.success === true, "GET /api/credits returns 200 OK");
    assert(credData.credits === initialCredits + 100, `GET /api/credits confirms updated credit balance (${credData.credits})`);
    assert(credData.plan === "pro", "GET /api/credits confirms updated plan ('pro')");
  } catch (err) {
    assert(false, `Test 4 failed: ${err.message}`);
  }

  // Cleanup test user
  await supabase.auth.admin.deleteUser(userId);

  console.log("\n==================================================");
  console.log(`Verification Test Results: ${testPassed} Passed, ${testFailed} Failed`);
  console.log("==================================================");

  if (testFailed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Verification test suite error:", err);
  process.exit(1);
});
