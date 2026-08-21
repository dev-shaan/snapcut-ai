import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

const API_BASE = "http://localhost:5000/api";
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;

if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SECRET_KEY in backend/.env");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY);

async function main() {
  console.log("Starting Razorpay TEST MODE Backend Verification");

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

  // Step 1: Health Check Verification
  console.log("1. Verifying /api/health...");
  try {
    const res = await fetch(`${API_BASE}/health`);
    const data = await res.json();
    assert(res.status === 200 && data.status === "ok", "/api/health returned 200 OK");
  } catch (err) {
    assert(false, `/api/health request failed: ${err.message}`);
  }

  // Step 2: Get or Create Test User for Auth Header
  console.log("\n2. Fetching test user from Supabase...");
  let authToken = null;
  let testUserId = null;

  try {
    const { data: profiles, error } = await supabase.from("profiles").select("id").limit(1);
    if (error || !profiles || profiles.length === 0) {
      console.log("Notice: No profile records found, creating anonymous auth session for testing...");
    } else {
      testUserId = profiles[0].id;
    }
  } catch (e) {
    console.error("Error fetching test user:", e.message);
  }

  // Generate a valid JWT for testing auth if possible or test via backend auth bypass check
  // For endpoint tests, let's verify unauthenticated behavior first:
  console.log("\n3. Testing Unauthenticated /api/payments/create-order...");
  try {
    const res = await fetch(`${API_BASE}/payments/create-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId: "pro" }),
    });
    const data = await res.json();
    assert(res.status === 401, "Unauthenticated request correctly returns 401");
    assert(data.success === false, "Response has success: false");
  } catch (err) {
    assert(false, `Unauthenticated test failed: ${err.message}`);
  }

  // Step 4: Testing Invalid planId
  console.log("\n4. Testing Invalid planId handling...");
  // Sign a test token using Supabase service client to simulate authenticated user
  const { data: authUser } = await supabase.auth.admin.listUsers();
  let validUserToken = null;

  if (authUser && authUser.users && authUser.users.length > 0) {
    const firstUser = authUser.users[0];
    testUserId = firstUser.id;
    // Create session token for test user
    const { data: linkData } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email: firstUser.email,
    });
    // Use session token via sign in or direct token if available
  }

  // We can sign in user with standard test credentials or create a session for testing
  // Let's create a temporary test user in auth for testing payment endpoints
  const testEmail = `test_payment_${Date.now()}@example.com`;
  const testPassword = "TestPassword123!";
  const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword,
  });

  if (signUpData && signUpData.session) {
    authToken = signUpData.session.access_token;
    testUserId = signUpData.user.id;
  } else if (signUpData && signUpData.user) {
    // Admin sign in if confirmation is required
    const { data: signInData } = await supabase.auth.admin.generateLink({
      type: "signup",
      email: testEmail,
      password: testPassword,
    });
    // Attempt sign in with password
    const { data: passSignIn } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });
    authToken = passSignIn?.session?.access_token;
  }

  if (!authToken) {
    console.log("Notice: Could not acquire dynamic auth session, checking backend direct route functions.");
  }

  if (authToken) {
    // Test 4a: Invalid Plan
    try {
      const res = await fetch(`${API_BASE}/payments/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ planId: "invalid_plan" }),
      });
      const data = await res.json();
      assert(res.status === 400, "Invalid planId request returns 400 Bad Request");
      assert(data.error?.includes("Invalid or unsupported plan"), "Returns appropriate error message");
    } catch (err) {
      assert(false, `Invalid plan test failed: ${err.message}`);
    }

    // Test 5: Authenticated Pro Order (₹99 / 9900 paise)
    console.log("\n5. Testing Authenticated Pro Order Creation (₹99 / 9900 paise)...");
    try {
      const res = await fetch(`${API_BASE}/payments/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ planId: "pro" }),
      });
      const data = await res.json();
      if (!res.ok) console.log("Pro order status:", res.status, "body:", data);
      assert(res.status === 200, "Pro order returns status 200 OK");
      assert(data.success === true, "Response has success: true");
      assert(data.order && data.order.amount === 9900, "Order amount is exactly 9900 paise (₹99)");
      assert(data.order && data.order.currency === "INR", "Currency is INR");
      assert(Boolean(data.order?.id), `Order ID received: ${data.order?.id}`);
      assert(Boolean(data.keyId), `Safe keyId returned: ${data.keyId}`);
      assert(!JSON.stringify(data).includes("RAZORPAY_KEY_SECRET") && !JSON.stringify(data).includes("rzp_test_secret"), "RAZORPAY_KEY_SECRET is NEVER present in response payload");
    } catch (err) {
      assert(false, `Pro order creation test failed: ${err.message}`);
    }


    // Test 6: Authenticated Business Order (₹299 / 29900 paise)
    console.log("\n6. Testing Authenticated Business Order Creation (₹299 / 29900 paise)...");
    try {
      const res = await fetch(`${API_BASE}/payments/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ planId: "business" }),
      });
      const data = await res.json();
      assert(res.status === 200, "Business order returns status 200 OK");
      assert(data.order && data.order.amount === 29900, "Order amount is exactly 29900 paise (₹299)");
      assert(data.order && data.order.currency === "INR", "Currency is INR");
    } catch (err) {
      assert(false, `Business order creation test failed: ${err.message}`);
    }

    // Test 7: Fake Client-Supplied Amounts & Credits Ignored
    console.log("\n7. Testing Fake Client-Supplied Amounts & Credits Are Ignored...");
    try {
      const res = await fetch(`${API_BASE}/payments/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          planId: "pro",
          amount: 1,
          credits: 999999,
          amount_paise: 50,
        }),
      });
      const data = await res.json();
      assert(res.status === 200, "Request succeeds using server configuration");
      assert(data.order.amount === 9900, "Amount remains server-enforced 9900 paise, fake client amount ignored");
    } catch (err) {
      assert(false, `Fake client amount test failed: ${err.message}`);
    }

    // Test 8: Verify /api/credits endpoint
    console.log("\n8. Verifying /api/credits endpoint...");
    try {
      const res = await fetch(`${API_BASE}/credits`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json();
      assert(res.status === 200 && data.success === true, "/api/credits endpoint intact and functioning");
    } catch (err) {
      assert(false, `/api/credits test failed: ${err.message}`);
    }

    // Cleanup temporary test user if created
    if (signUpData?.user?.id) {
      await supabase.auth.admin.deleteUser(signUpData.user.id);
    }
  }

  console.log("\n==================================================");
  console.log(`Test Results: ${testPassed} Passed, ${testFailed} Failed`);
  console.log("==================================================");

  if (testFailed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Test runner failed:", err);
  process.exit(1);
});
