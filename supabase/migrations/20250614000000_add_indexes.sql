-- Improve query performance for payment lookups
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_created_at ON payments(created_at DESC);
CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_payments_method ON payments(method);

-- Improve mass intention queries
CREATE INDEX idx_mass_intentions_date ON mass_intentions(date);
CREATE INDEX idx_mass_intentions_status ON mass_intentions(status);
CREATE INDEX idx_mass_intentions_church_id ON mass_intentions(church_id);

-- Improve user queries
CREATE INDEX idx_users_church_id ON users(church_id) WHERE role = 'priest';
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- Full text search for intentions
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_mass_intentions_intention_trgm ON mass_intentions USING gin(intention gin_trgm_ops);

-- Composite indexes for common queries
CREATE INDEX idx_mass_intentions_church_date ON mass_intentions(church_id, date);
CREATE INDEX idx_payments_status_created ON payments(status, created_at DESC);

-- Partial indexes for active records
CREATE INDEX idx_active_mass_intentions ON mass_intentions(date, status)
WHERE status NOT IN ('cancelled', 'completed');

CREATE INDEX idx_pending_payments ON payments(created_at)
WHERE status = 'pending';
