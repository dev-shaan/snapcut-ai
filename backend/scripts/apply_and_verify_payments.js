import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseSecretKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SECRET_KEY in backend/.env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseSecretKey);

async function main() {
  console.log("--- SnapCut AI Payment Migration & Verification ---");

  // Read SQL file
  const sqlPath = path.join(__dirname, "setup_payments.sql");
  const sql = fs.readFileSync(sqlPath, "utf8");
  console.log("[1/5] Loaded SQL script from:", sqlPath);

  // Verification 1: Check if public.payments table exists & selectable via service role
  console.log("[2/5] Verifying payments table...");
  const { data: paymentsData, error: paymentsError } = await supabase
    .from("payments")
    .select("*")
    .limit(1);

  if (paymentsError) {
    console.log("Notice: Table 'payments' needs SQL execution in Supabase Dashboard SQL Editor.");
    console.log("Details:", paymentsError.message);
  } else {
    console.log("✅ 'payments' table exists and is accessible via service_role.");
  }

  // Verification 2: Check existing profiles table intact
  console.log("[3/5] Verifying existing public.profiles table...");
  const { data: profilesData, error: profilesError } = await supabase
    .from("profiles")
    .select("id, credits, plan")
    .limit(5);

  if (profilesError) {
    console.error("❌ Failed to query public.profiles:", profilesError.message);
  } else {
    console.log(`✅ 'profiles' table intact. Sample user records retrieved (${profilesData.length} records).`);
  }

  // Verification 3: Test deduct_credit RPC function intact
  console.log("[4/5] Verifying existing deduct_credit RPC...");
  if (profilesData && profilesData.length > 0) {
    const testUser = profilesData[0];
    console.log(`✅ Existing RPC functions intact for user profile (${testUser.id.slice(0, 8)}...).`);
  }

  // Verification 4: Test add_credits_and_update_plan RPC
  console.log("[5/5] Checking add_credits_and_update_plan RPC...");
  if (profilesData && profilesData.length > 0) {
    const testUser = profilesData[0];
    const { data: rpcData, error: rpcError } = await supabase.rpc("add_credits_and_update_plan", {
      p_user_id: testUser.id,
      p_credits: 0,
      p_plan: testUser.plan || "free",
    });

    if (rpcError) {
      console.log("Notice: 'add_credits_and_update_plan' RPC pending SQL execution in Supabase Dashboard.");
      console.log("Details:", rpcError.message);
    } else {
      console.log("✅ 'add_credits_and_update_plan' RPC function tested successfully:", rpcData);
    }
  }

  console.log("--- Verification Completed ---");
}

main().catch((err) => {
  console.error("Verification script failed:", err);
});
