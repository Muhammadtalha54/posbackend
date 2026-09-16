-- ============================================
-- POS System — 003 Add Credit Sales
-- ============================================

ALTER TABLE sales ADD COLUMN customer_name TEXT;
ALTER TABLE sales ADD COLUMN payment_status TEXT DEFAULT 'paid';
