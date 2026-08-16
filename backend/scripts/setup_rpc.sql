-- SnapCut AI — Atomic Credit Operations RPC Functions for Supabase PostgreSQL
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard -> SQL Editor)

CREATE OR REPLACE FUNCTION public.deduct_credit(p_user_id UUID)
RETURNS TABLE (success BOOLEAN, remaining_credits INT) AS $$
DECLARE
  v_remaining INT;
BEGIN
  UPDATE public.profiles
  SET credits = credits - 1
  WHERE id = p_user_id AND credits >= 1
  RETURNING credits INTO v_remaining;

  IF FOUND THEN
    RETURN QUERY SELECT TRUE, v_remaining;
  ELSE
    SELECT credits INTO v_remaining FROM public.profiles WHERE id = p_user_id;
    RETURN QUERY SELECT FALSE, COALESCE(v_remaining, 0);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.refund_credit(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.profiles
  SET credits = credits + 1
  WHERE id = p_user_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Notify PostgREST to reload its schema cache immediately
NOTIFY pgrst, 'reload schema';
