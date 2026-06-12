-- =============================================================================
-- OutGen — COMPLETE DATABASE SCHEMA (run this ONE file in Supabase SQL Editor)
-- Replaces 001 + 002 + 003 + 004. Safe to re-run (idempotent).
-- =============================================================================

-- PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  city TEXT,
  country TEXT,
  address_line TEXT,
  maps_url TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  phone TEXT,
  signup_ip TEXT,
  device_id TEXT,
  vpn_flag BOOLEAN NOT NULL DEFAULT FALSE,
  onboarding_complete BOOLEAN NOT NULL DEFAULT FALSE,
  credits_balance INT NOT NULL DEFAULT 1 CHECK (credits_balance >= 0),
  subscription_active BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS signup_ip TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS device_id TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS vpn_flag BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_complete BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_profiles_signup_ip ON public.profiles (signup_ip);
CREATE INDEX IF NOT EXISTS idx_profiles_device_id ON public.profiles (device_id);

-- DESIGNS
CREATE TABLE IF NOT EXISTS public.designs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Untitled design',
  selection JSONB NOT NULL DEFAULT '{}'::jsonb,
  logo_description TEXT NOT NULL DEFAULT '',
  user_prompt TEXT NOT NULL DEFAULT '',
  generated_views JSONB NOT NULL DEFAULT '{}'::jsonb,
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_designs_user ON public.designs (user_id);
CREATE INDEX IF NOT EXISTS idx_designs_updated ON public.designs (user_id, updated_at DESC);

-- PRINT ORDERS
CREATE TABLE IF NOT EXISTS public.print_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  design_id UUID REFERENCES public.designs (id) ON DELETE SET NULL,
  product_type TEXT NOT NULL,
  quality TEXT NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0 AND quantity <= 50),
  credits_per_unit INT NOT NULL,
  credits_total INT NOT NULL,
  maps_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'production', 'shipped', 'delivered')),
  eta_days INT NOT NULL DEFAULT 7,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_print_orders_user ON public.print_orders (user_id);

-- CREDIT LEDGER
CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  delta INT NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- SIGNUP ATTEMPTS
CREATE TABLE IF NOT EXISTS public.signup_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip TEXT NOT NULL,
  device_id TEXT,
  vpn_detected BOOLEAN NOT NULL DEFAULT FALSE,
  blocked BOOLEAN NOT NULL DEFAULT FALSE,
  reason TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_signup_attempts_ip ON public.signup_attempts (ip, created_at DESC);

-- NEW USER TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, credits_balance)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', split_part(NEW.email, '@', 1)),
    1
  );

  INSERT INTO public.credit_transactions (user_id, delta, reason)
  VALUES (NEW.id, 1, 'welcome_bonus');

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- PRINT ORDER (latest pricing)
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
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF p_maps_url IS NULL OR length(trim(p_maps_url)) < 8 THEN
    RAISE EXCEPTION 'Valid delivery location required';
  END IF;

  v_base := CASE p_product_type
    WHEN 'tee' THEN 1
    WHEN 'shorts' THEN 1
    WHEN 'cap' THEN 1
    WHEN 'sweatshirt' THEN 3
    WHEN 'pants' THEN 5
    WHEN 'cargo' THEN 5
    WHEN 'hoodie' THEN 7
    WHEN 'outerwear' THEN 10
    ELSE NULL
  END;

  IF v_base IS NULL THEN RAISE EXCEPTION 'Unknown product type'; END IF;

  v_extra := CASE p_quality
    WHEN 'light_cotton' THEN 0
    WHEN 'heavy_cotton' THEN 1
    WHEN 'premium_blend' THEN 4
    ELSE NULL
  END;

  IF v_extra IS NULL THEN RAISE EXCEPTION 'Unknown quality'; END IF;

  v_per := v_base + v_extra;
  v_total := v_per * p_quantity;

  SELECT credits_balance INTO v_balance FROM public.profiles WHERE id = v_user_id FOR UPDATE;
  IF v_balance IS NULL THEN RAISE EXCEPTION 'Profile not found'; END IF;
  IF v_balance < v_total THEN
    RAISE EXCEPTION 'Not enough credits (need %, have %)', v_total, v_balance;
  END IF;

  UPDATE public.profiles SET credits_balance = credits_balance - v_total, updated_at = now() WHERE id = v_user_id;
  INSERT INTO public.credit_transactions (user_id, delta, reason) VALUES (v_user_id, -v_total, 'print_order');

  INSERT INTO public.print_orders (
    user_id, design_id, product_type, quality, quantity, credits_per_unit, credits_total, maps_url
  ) VALUES (
    v_user_id, p_design_id, p_product_type, p_quality, p_quantity, v_per, v_total, trim(p_maps_url)
  ) RETURNING id INTO v_order_id;

  RETURN v_order_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.add_credits(p_amount INT, p_reason TEXT)
RETURNS INT LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_user_id UUID := auth.uid(); v_new INT;
BEGIN
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF p_amount <= 0 OR p_amount > 100 THEN RAISE EXCEPTION 'Invalid amount'; END IF;
  UPDATE public.profiles SET credits_balance = credits_balance + p_amount, updated_at = now()
  WHERE id = v_user_id RETURNING credits_balance INTO v_new;
  INSERT INTO public.credit_transactions (user_id, delta, reason) VALUES (v_user_id, p_amount, p_reason);
  RETURN v_new;
END;
$$;

CREATE OR REPLACE FUNCTION public.activate_studio_subscription()
RETURNS INT LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_user_id UUID := auth.uid(); v_new INT;
BEGIN
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  UPDATE public.profiles SET subscription_active = TRUE, credits_balance = credits_balance + 3, updated_at = now()
  WHERE id = v_user_id RETURNING credits_balance INTO v_new;
  INSERT INTO public.credit_transactions (user_id, delta, reason) VALUES (v_user_id, 3, 'monthly_subscription');
  RETURN v_new;
END;
$$;

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.print_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS profiles_select_own ON public.profiles;
CREATE POLICY profiles_select_own ON public.profiles FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS profiles_update_own ON public.profiles;
CREATE POLICY profiles_update_own ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS designs_all_own ON public.designs;
CREATE POLICY designs_all_own ON public.designs FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS print_orders_select_own ON public.print_orders;
CREATE POLICY print_orders_select_own ON public.print_orders FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS print_orders_insert_own ON public.print_orders;
CREATE POLICY print_orders_insert_own ON public.print_orders FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS credit_tx_select_own ON public.credit_transactions;
CREATE POLICY credit_tx_select_own ON public.credit_transactions FOR SELECT USING (auth.uid() = user_id);

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.designs TO authenticated;
GRANT ALL ON public.print_orders TO authenticated;
GRANT SELECT ON public.credit_transactions TO authenticated;
GRANT EXECUTE ON FUNCTION public.place_print_order TO authenticated;
GRANT EXECUTE ON FUNCTION public.add_credits TO authenticated;
GRANT EXECUTE ON FUNCTION public.activate_studio_subscription TO authenticated;
