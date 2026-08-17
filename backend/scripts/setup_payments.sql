-- SnapCut AI — Razorpay Payment Schema & Credit Management RPC for Supabase PostgreSQL
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard -> SQL Editor)

-- 1. Create public.payments Table
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  razorpay_order_id TEXT UNIQUE NOT NULL,
  razorpay_payment_id TEXT UNIQUE,
  razorpay_signature TEXT,
  plan_id TEXT NOT NULL,
  billing_cycle TEXT NOT NULL,
  amount_paise INTEGER NOT NULL,
  credits_added INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'created',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  CONSTRAINT payments_plan_id_check CHECK (plan_id IN ('free', 'pro', 'business')),
  CONSTRAINT payments_billing_cycle_check CHECK (billing_cycle = 'monthly'),
  CONSTRAINT payments_status_check CHECK (status IN ('created', 'paid', 'failed')),
  CONSTRAINT payments_amount_paise_check CHECK (amount_paise >= 0),
  CONSTRAINT payments_credits_added_check CHECK (credits_added >= 0)
);

-- Indexes for fast query of user payments
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_razorpay_order_id ON public.payments(razorpay_order_id);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running
DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;

-- RLS Policy: Users can ONLY select/read their own payment records
CREATE POLICY "Users can view own payments"
ON public.payments
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Note: No INSERT, UPDATE, or DELETE policies are granted to 'authenticated' role.
-- Payment creation, status updates, and credit allocations must strictly occur via
-- the Express backend (using Supabase secret key / service role) or SECURITY DEFINER RPCs.

-- 3. Create Atomic Credit & Plan Update RPC Function
CREATE OR REPLACE FUNCTION public.add_credits_and_update_plan(
  p_user_id UUID,
  p_credits INTEGER,
  p_plan TEXT
)
RETURNS TABLE (credits INT, plan TEXT) AS $$
DECLARE
  v_new_credits INT;
  v_new_plan TEXT;
BEGIN
  -- Prevent negative credit changes
  IF p_credits < 0 THEN
    RAISE EXCEPTION 'p_credits must be non-negative (received %)', p_credits;
  END IF;

  -- Validate plan input
  IF p_plan NOT IN ('free', 'pro', 'business') THEN
    RAISE EXCEPTION 'Invalid plan_id: %', p_plan;
  END IF;

  -- Atomically add credits and update plan
  UPDATE public.profiles
  SET
    credits = public.profiles.credits + p_credits,
    plan = p_plan
  WHERE id = p_user_id
  RETURNING public.profiles.credits, public.profiles.plan INTO v_new_credits, v_new_plan;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User profile not found for user_id %', p_user_id;
  END IF;

  RETURN QUERY SELECT v_new_credits, v_new_plan;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;

REVOKE EXECUTE ON FUNCTION public.add_credits_and_update_plan(UUID, INTEGER, TEXT)
FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.add_credits_and_update_plan(UUID, INTEGER, TEXT)
TO service_role;

NOTIFY pgrst, 'reload schema';
