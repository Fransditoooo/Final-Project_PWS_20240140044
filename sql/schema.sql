CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(80) NOT NULL,
  key_hash CHAR(64) UNIQUE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  request_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_used_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS laptops (
  id SERIAL PRIMARY KEY,
  sku VARCHAR(30) UNIQUE NOT NULL,
  name VARCHAR(150) NOT NULL,
  brand VARCHAR(60) NOT NULL,
  model VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  price NUMERIC(14,2) NOT NULL CHECK (price >= 0),
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  rating NUMERIC(2,1) CHECK (rating >= 0 AND rating <= 5),
  release_year INTEGER,
  cpu VARCHAR(120),
  gpu VARCHAR(120),
  ram_gb INTEGER,
  storage_gb INTEGER,
  storage_type VARCHAR(30),
  display_size NUMERIC(4,1),
  display_resolution VARCHAR(30),
  operating_system VARCHAR(80),
  weight_kg NUMERIC(4,2),
  color VARCHAR(40),
  specs JSONB NOT NULL DEFAULT '{}'::jsonb,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_laptops_brand ON laptops(brand);
CREATE INDEX IF NOT EXISTS idx_laptops_category ON laptops(category);
CREATE INDEX IF NOT EXISTS idx_laptops_price ON laptops(price);
CREATE INDEX IF NOT EXISTS idx_laptops_name ON laptops(name);
CREATE INDEX IF NOT EXISTS idx_api_keys_user ON api_keys(user_id);

ALTER TABLE laptops ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- API server menggunakan service/database connection langsung.
-- Jangan membuat policy publik yang membuka password_hash atau key_hash.
