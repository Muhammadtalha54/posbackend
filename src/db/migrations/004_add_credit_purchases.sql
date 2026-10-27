-- ============================================
-- POS System — 004 Add Credit Purchases
-- ============================================

ALTER TABLE purchases ADD COLUMN IF NOT EXISTS paid_amount INTEGER DEFAULT 0;
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS due_amount INTEGER DEFAULT 0;
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'paid';
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS payment_type TEXT DEFAULT 'cash';
