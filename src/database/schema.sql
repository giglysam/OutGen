-- OutGen — schéma cible (non branché en production mock)
-- Compatible Postgres / Supabase pour déploiement Vercel + Edge.

-- Utilisateurs (auth réelle : Clerk, Supabase Auth, ou Auth.js)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  plan TEXT NOT NULL CHECK (plan IN ('classic', 'premium', 'enterprise')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Sessions / refresh tokens gérés par le provider d’auth

-- Projets de tenue (sélections studio)
CREATE TABLE outfit_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users (id) ON DELETE CASCADE,
  title TEXT,
  selection_json JSONB NOT NULL,
  logo_notes TEXT,
  user_prompt TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Résultats générés (URLs stockées après upload bucket)
CREATE TABLE generated_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES outfit_projects (id) ON DELETE CASCADE,
  angle TEXT NOT NULL,
  image_url TEXT NOT NULL,
  prompt_used TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Vidéos sociales (Premium+)
CREATE TABLE social_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users (id) ON DELETE CASCADE,
  platform TEXT,
  video_url TEXT,
  status TEXT DEFAULT 'queued',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Marketplace (listing)
CREATE TABLE listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users (id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  price_cents INT,
  currency TEXT DEFAULT 'EUR',
  stock INT DEFAULT 0,
  preview_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_projects_user ON outfit_projects (user_id);
CREATE INDEX idx_assets_project ON generated_assets (project_id);
