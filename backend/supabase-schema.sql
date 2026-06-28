-- ============================================================
-- ShopNow — Supabase SQL Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- USERS table
CREATE TABLE IF NOT EXISTS users (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  email      TEXT UNIQUE NOT NULL,
  password   TEXT NOT NULL,
  role       TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  avatar     TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PRODUCTS table
CREATE TABLE IF NOT EXISTS products (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  price       NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  image       TEXT NOT NULL,
  description TEXT DEFAULT '',
  category    TEXT NOT NULL,
  stock       INTEGER DEFAULT 0 CHECK (stock >= 0),
  featured    BOOLEAN DEFAULT FALSE,
  avg_rating  NUMERIC(3,2) DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ORDERS table
CREATE TABLE IF NOT EXISTS orders (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID REFERENCES users(id) ON DELETE CASCADE,
  items            JSONB NOT NULL,          -- array of {product_id, name, image, price, qty}
  shipping_address JSONB,                   -- {address, city, country, zip}
  total_price      NUMERIC(10,2) NOT NULL,
  shipping_cost    NUMERIC(10,2) DEFAULT 0,
  status           TEXT DEFAULT 'pending' CHECK (status IN ('pending','processing','shipped','delivered','cancelled')),
  is_paid          BOOLEAN DEFAULT FALSE,
  is_delivered     BOOLEAN DEFAULT FALSE,
  paid_at          TIMESTAMPTZ,
  delivered_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update updated_at on any change
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated    BEFORE UPDATE ON users    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_products_updated BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_orders_updated   BEFORE UPDATE ON orders   FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_name     ON products USING gin(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_orders_user_id    ON orders(user_id);

-- Row Level Security (RLS) — optional but recommended
ALTER TABLE users    ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders   ENABLE ROW LEVEL SECURITY;

-- Public can read products
CREATE POLICY "products_public_read" ON products FOR SELECT USING (true);

-- Users can read/update their own data
CREATE POLICY "users_own_data"  ON users  FOR ALL USING (auth.uid()::text = id::text);
CREATE POLICY "orders_own_data" ON orders FOR ALL USING (auth.uid()::text = user_id::text);

-- NOTE: Server uses service_role key so it bypasses RLS — policies protect direct client access
