-- ============================================
-- MONTRA - Supabase Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CATEGORIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  type        TEXT NOT NULL CHECK (type IN ('income', 'expense', 'both')),
  icon        TEXT NOT NULL DEFAULT 'MoreHorizontal',
  color       TEXT NOT NULL DEFAULT '#9CA3AF',
  is_default  BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TRANSACTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS transactions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type        TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount      NUMERIC(15,2) NOT NULL CHECK (amount > 0),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  note        TEXT,
  date        DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- BUDGETS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS budgets (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  amount      NUMERIC(15,2) NOT NULL CHECK (amount > 0),
  month       TEXT NOT NULL, -- format: 'yyyy-MM'
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, category_id, month)
);

-- ============================================
-- SAVINGS GOALS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS savings_goals (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,
  target_amount  NUMERIC(15,2) NOT NULL CHECK (target_amount > 0),
  current_amount NUMERIC(15,2) DEFAULT 0 CHECK (current_amount >= 0),
  deadline       DATE,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- DEBTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS debts (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type         TEXT NOT NULL CHECK (type IN ('payable', 'receivable')),
  person_name  TEXT NOT NULL,
  amount       NUMERIC(15,2) NOT NULL CHECK (amount > 0),
  paid_amount  NUMERIC(15,2) DEFAULT 0,
  due_date     DATE,
  status       TEXT DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'paid')),
  note         TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE categories    ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets       ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE debts         ENABLE ROW LEVEL SECURITY;

-- Categories policies (user's own + defaults)
CREATE POLICY "categories_select" ON categories FOR SELECT USING (user_id = auth.uid() OR is_default = TRUE);
CREATE POLICY "categories_insert" ON categories FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "categories_update" ON categories FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "categories_delete" ON categories FOR DELETE USING (user_id = auth.uid() AND is_default = FALSE);

-- Transactions policies
CREATE POLICY "transactions_all" ON transactions USING (user_id = auth.uid());
CREATE POLICY "transactions_insert" ON transactions FOR INSERT WITH CHECK (user_id = auth.uid());

-- Budgets policies
CREATE POLICY "budgets_all" ON budgets USING (user_id = auth.uid());
CREATE POLICY "budgets_insert" ON budgets FOR INSERT WITH CHECK (user_id = auth.uid());

-- Savings goals policies
CREATE POLICY "savings_all" ON savings_goals USING (user_id = auth.uid());
CREATE POLICY "savings_insert" ON savings_goals FOR INSERT WITH CHECK (user_id = auth.uid());

-- Debts policies
CREATE POLICY "debts_all" ON debts USING (user_id = auth.uid());
CREATE POLICY "debts_insert" ON debts FOR INSERT WITH CHECK (user_id = auth.uid());

-- ============================================
-- DEFAULT CATEGORIES SEED
-- ============================================
INSERT INTO categories (name, type, icon, color, is_default) VALUES
  ('Gaji',           'income',  'Briefcase',      '#34D399', TRUE),
  ('Freelance',      'income',  'Laptop',          '#34D399', TRUE),
  ('Investasi',      'income',  'TrendingUp',      '#60A5FA', TRUE),
  ('Hadiah',         'income',  'Gift',            '#A78BFA', TRUE),
  ('Bonus',          'income',  'Star',            '#FBBF24', TRUE),
  ('Makanan',        'expense', 'UtensilsCrossed', '#FB7185', TRUE),
  ('Kopi & Minuman', 'expense', 'Coffee',          '#FB923C', TRUE),
  ('Transportasi',   'expense', 'Car',             '#60A5FA', TRUE),
  ('Belanja',        'expense', 'ShoppingBag',     '#A78BFA', TRUE),
  ('Tagihan',        'expense', 'Receipt',         '#FBBF24', TRUE),
  ('Kesehatan',      'expense', 'Heart',           '#FB7185', TRUE),
  ('Hiburan',        'expense', 'Gamepad2',        '#2DD4BF', TRUE),
  ('Pendidikan',     'expense', 'BookOpen',        '#60A5FA', TRUE),
  ('Rumah',          'expense', 'Home',            '#F472B6', TRUE),
  ('Lainnya',        'expense', 'MoreHorizontal',  '#9CA3AF', TRUE);

-- ============================================
-- REALTIME PUBLICATION
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE transactions;

-- ============================================
-- ADD emoji COLUMN to savings_goals (if not exists)
-- Run this if you already ran the initial schema
-- ============================================
ALTER TABLE savings_goals ADD COLUMN IF NOT EXISTS emoji TEXT DEFAULT '💰';
