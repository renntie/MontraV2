-- ============================================================
-- MONTRA - Supabase Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- CATEGORIES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  icon        TEXT DEFAULT 'MoreHorizontal',
  color       TEXT DEFAULT '#9CA3AF',
  type        TEXT NOT NULL CHECK (type IN ('income', 'expense', 'both')) DEFAULT 'expense',
  is_default  BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own + default categories"
  ON categories FOR SELECT
  USING (user_id = auth.uid() OR is_default = TRUE);

CREATE POLICY "Users can insert own categories"
  ON categories FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own categories"
  ON categories FOR UPDATE USING (user_id = auth.uid() AND is_default = FALSE);

CREATE POLICY "Users can delete own categories"
  ON categories FOR DELETE USING (user_id = auth.uid() AND is_default = FALSE);

-- ============================================================
-- SEED DEFAULT CATEGORIES
-- ============================================================
INSERT INTO categories (name, icon, color, type, is_default) VALUES
  -- Income
  ('Gaji',         'Briefcase',  '#34D399', 'income',  TRUE),
  ('Freelance',    'Laptop',     '#60A5FA', 'income',  TRUE),
  ('Investasi',    'TrendingUp', '#A78BFA', 'income',  TRUE),
  ('Bonus',        'Star',       '#FBBF24', 'income',  TRUE),
  ('Hadiah',       'Gift',       '#F472B6', 'income',  TRUE),
  -- Expense
  ('Makanan',      'UtensilsCrossed', '#FB7185', 'expense', TRUE),
  ('Transport',    'Car',             '#60A5FA', 'expense', TRUE),
  ('Belanja',      'ShoppingBag',     '#A78BFA', 'expense', TRUE),
  ('Tagihan',      'Receipt',         '#FBBF24', 'expense', TRUE),
  ('Kesehatan',    'Heart',           '#FB7185', 'expense', TRUE),
  ('Hiburan',      'Gamepad2',        '#34D399', 'expense', TRUE),
  ('Pendidikan',   'BookOpen',        '#60A5FA', 'expense', TRUE),
  ('Rumah',        'Home',            '#2DD4BF', 'expense', TRUE),
  ('Kopi',         'Coffee',          '#FB923C', 'expense', TRUE),
  ('Perjalanan',   'Plane',           '#818CF8', 'expense', TRUE),
  ('Lainnya',      'MoreHorizontal',  '#9CA3AF', 'expense', TRUE)
ON CONFLICT DO NOTHING;

-- ============================================================
-- TRANSACTIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS transactions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  type        TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount      NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
  note        TEXT,
  date        DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own transactions"
  ON transactions FOR ALL USING (user_id = auth.uid());

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_user_type ON transactions(user_id, type);

-- ============================================================
-- BUDGETS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS budgets (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  amount      NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
  month       TEXT NOT NULL, -- Format: 'YYYY-MM'
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, category_id, month)
);

ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own budgets"
  ON budgets FOR ALL USING (user_id = auth.uid());

-- ============================================================
-- SAVINGS GOALS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS savings_goals (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,
  emoji          TEXT DEFAULT '💰',
  target_amount  NUMERIC(15, 2) NOT NULL CHECK (target_amount > 0),
  current_amount NUMERIC(15, 2) DEFAULT 0,
  target_date    DATE,
  is_achieved    BOOLEAN DEFAULT FALSE,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own savings goals"
  ON savings_goals FOR ALL USING (user_id = auth.uid());

-- ============================================================
-- DEBTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS debts (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type        TEXT NOT NULL CHECK (type IN ('debt', 'receivable')),
  person_name TEXT NOT NULL,
  amount      NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
  description TEXT,
  due_date    DATE,
  is_settled  BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE debts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own debts"
  ON debts FOR ALL USING (user_id = auth.uid());

-- ============================================================
-- REALTIME: Enable for transactions
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE transactions;

-- ============================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER savings_goals_updated_at
  BEFORE UPDATE ON savings_goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER debts_updated_at
  BEFORE UPDATE ON debts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
