-- ============================================
-- MONTRA V2 — Schema Additions
-- Jalankan ini di Supabase SQL Editor
-- (Hanya tambahan, bukan pengganti schema lama)
-- ============================================

-- ============================================
-- WALLETS TABLE (Multi-Wallet)
-- ============================================
CREATE TABLE IF NOT EXISTS wallets (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  type            TEXT NOT NULL DEFAULT 'cash'
                    CHECK (type IN ('cash', 'bank', 'ewallet', 'investment', 'other')),
  icon            TEXT NOT NULL DEFAULT 'Wallet',
  color           TEXT NOT NULL DEFAULT '#34D399',
  initial_balance NUMERIC(15,2) NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wallets_all"    ON wallets USING (user_id = auth.uid());
CREATE POLICY "wallets_insert" ON wallets FOR INSERT WITH CHECK (user_id = auth.uid());

-- ============================================
-- TRANSFERS TABLE (Transfer Antar Dompet)
-- ============================================
CREATE TABLE IF NOT EXISTS transfers (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  from_wallet_id  UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  to_wallet_id    UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  amount          NUMERIC(15,2) NOT NULL CHECK (amount > 0),
  note            TEXT,
  date            DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE transfers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "transfers_all"    ON transfers USING (user_id = auth.uid());
CREATE POLICY "transfers_insert" ON transfers FOR INSERT WITH CHECK (user_id = auth.uid());

-- ============================================
-- ADD wallet_id TO TRANSACTIONS
-- ============================================
ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS wallet_id UUID REFERENCES wallets(id) ON DELETE SET NULL;

-- ============================================
-- SUBSCRIPTIONS TABLE (Recurring Tracker)
-- ============================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  amount      NUMERIC(15,2) NOT NULL CHECK (amount > 0),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  wallet_id   UUID REFERENCES wallets(id) ON DELETE SET NULL,
  frequency   TEXT NOT NULL DEFAULT 'monthly'
                CHECK (frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
  next_due    DATE NOT NULL,
  note        TEXT,
  is_active   BOOLEAN DEFAULT TRUE,
  icon        TEXT DEFAULT 'RefreshCw',
  color       TEXT DEFAULT '#60A5FA',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "subscriptions_all"    ON subscriptions USING (user_id = auth.uid());
CREATE POLICY "subscriptions_insert" ON subscriptions FOR INSERT WITH CHECK (user_id = auth.uid());

-- ============================================
-- REALTIME PUBLICATIONS (optional)
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE wallets;
ALTER PUBLICATION supabase_realtime ADD TABLE transfers;
ALTER PUBLICATION supabase_realtime ADD TABLE subscriptions;
