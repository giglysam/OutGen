-- Print tracking + admin credit grants
ALTER TABLE public.print_orders ADD COLUMN IF NOT EXISTS tracking_number TEXT;
ALTER TABLE public.print_orders ADD COLUMN IF NOT EXISTS tracking_url TEXT;
ALTER TABLE public.print_orders ADD COLUMN IF NOT EXISTS status_note TEXT;
ALTER TABLE public.print_orders ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMPTZ;
ALTER TABLE public.print_orders ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ;
ALTER TABLE public.print_orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

CREATE OR REPLACE FUNCTION public.admin_grant_credits(
  p_user_id UUID,
  p_amount INT,
  p_reason TEXT DEFAULT 'admin_grant'
)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_new INT;
BEGIN
  IF p_user_id IS NULL THEN RAISE EXCEPTION 'user_id required'; END IF;
  IF p_amount IS NULL OR p_amount <= 0 OR p_amount > 500 THEN
    RAISE EXCEPTION 'Invalid credit amount';
  END IF;
  UPDATE public.profiles
  SET credits_balance = credits_balance + p_amount, updated_at = now()
  WHERE id = p_user_id
  RETURNING credits_balance INTO v_new;
  IF v_new IS NULL THEN RAISE EXCEPTION 'User not found'; END IF;
  INSERT INTO public.credit_transactions (user_id, delta, reason)
  VALUES (p_user_id, p_amount, COALESCE(NULLIF(trim(p_reason), ''), 'admin_grant'));
  RETURN v_new;
END;
$$;
