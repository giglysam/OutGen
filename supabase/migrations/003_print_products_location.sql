-- Print product on saved designs + expanded product pricing
ALTER TABLE public.designs
  ADD COLUMN IF NOT EXISTS print_product TEXT;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

CREATE OR REPLACE FUNCTION public.place_print_order(
  p_design_id UUID,
  p_product_type TEXT,
  p_quality TEXT,
  p_quantity INT,
  p_maps_url TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_base INT;
  v_extra INT := 0;
  v_per INT;
  v_total INT;
  v_balance INT;
  v_order_id UUID;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF p_maps_url IS NULL OR length(trim(p_maps_url)) < 8 THEN
    RAISE EXCEPTION 'Valid delivery location required';
  END IF;

  v_base := CASE p_product_type
    WHEN 'tee' THEN 1
    WHEN 'shorts' THEN 1
    WHEN 'cap' THEN 1
    WHEN 'sweatshirt' THEN 2
    WHEN 'pants' THEN 3
    WHEN 'cargo' THEN 3
    WHEN 'hoodie' THEN 4
    WHEN 'outerwear' THEN 6
    ELSE NULL
  END;

  IF v_base IS NULL THEN
    RAISE EXCEPTION 'Unknown product type';
  END IF;

  v_extra := CASE p_quality
    WHEN 'light_cotton' THEN 0
    WHEN 'heavy_cotton' THEN 1
    WHEN 'premium_blend' THEN 4
    ELSE NULL
  END;

  IF v_extra IS NULL THEN
    RAISE EXCEPTION 'Unknown quality';
  END IF;

  v_per := v_base + v_extra;
  v_total := v_per * p_quantity;

  SELECT credits_balance INTO v_balance
  FROM public.profiles
  WHERE id = v_user_id
  FOR UPDATE;

  IF v_balance IS NULL THEN
    RAISE EXCEPTION 'Profile not found';
  END IF;

  IF v_balance < v_total THEN
    RAISE EXCEPTION 'Not enough credits (need %, have %)', v_total, v_balance;
  END IF;

  UPDATE public.profiles
  SET credits_balance = credits_balance - v_total,
      updated_at = now()
  WHERE id = v_user_id;

  INSERT INTO public.credit_transactions (user_id, delta, reason)
  VALUES (v_user_id, -v_total, 'print_order');

  INSERT INTO public.print_orders (
    user_id, design_id, product_type, quality, quantity,
    credits_per_unit, credits_total, maps_url
  )
  VALUES (
    v_user_id, p_design_id, p_product_type, p_quality, p_quantity,
    v_per, v_total, trim(p_maps_url)
  )
  RETURNING id INTO v_order_id;

  RETURN v_order_id;
END;
$$;
