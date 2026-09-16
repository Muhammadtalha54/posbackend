-- ============================================
-- Migration: Enable Row-Level Security (RLS)
-- ============================================
-- Supabase exposes a public API by default.
-- Since we are using our own custom Node.js backend,
-- we want to completely block the public Supabase API
-- from accessing our tables.
-- Our Node.js backend connects as a superuser/admin,
-- so it will automatically bypass these restrictions.
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_logs ENABLE ROW LEVEL SECURITY;
