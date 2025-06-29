-- OREMUS Complete Database Schema
-- Generated from project analysis
-- Generated at: 2025-06-25T05:13:31.325Z
-- Total tables: 3

-- Required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- BUSINESS TABLES

-- Table: payments (business)
-- Source files: project-analysis, payment.ts, PaymentService.ts, paymentService.ts, PaymentStatusService.ts
CREATE TABLE payments (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  organization_id UUID,
  stripe_payment_id TEXT,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'PLN',
  status TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);
COMMENT ON TABLE payments IS 'Category: business. Sources: project-analysis, payment.ts, PaymentService.ts, paymentService.ts, PaymentStatusService.ts';

-- Table: mass_intentions (business)
-- Source files: project-analysis, mass-intention.ts, mass.ts, parish.ts, MassIntentionService.ts, useMassIntentions.ts, MassOrderingService.ts, MassService.ts, massIntentionService.ts
CREATE TABLE mass_intentions (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  organization_id UUID NOT NULL,
  church_id UUID,
  intention_text TEXT NOT NULL,
  mass_date TIMESTAMP NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_id UUID,
  priest_id UUID,
  amount INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);
COMMENT ON TABLE mass_intentions IS 'Category: business. Sources: project-analysis, mass-intention.ts, mass.ts, parish.ts, MassIntentionService.ts, useMassIntentions.ts, MassOrderingService.ts, MassService.ts, massIntentionService.ts';

-- Table: oremus_candles (business)
-- Source files: project-analysis, candle.ts, CandleService.ts
CREATE TABLE oremus_candles (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  nfc_tag_id TEXT UNIQUE,
  user_id UUID NOT NULL,
  organization_id UUID,
  purchase_date TIMESTAMP NOT NULL,
  status TEXT NOT NULL,
  intention TEXT,
  duration_hours INTEGER NOT NULL DEFAULT 24,
  lit_at TIMESTAMP,
  extinguished_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);
COMMENT ON TABLE oremus_candles IS 'Category: business. Sources: project-analysis, candle.ts, CandleService.ts';

-- FOREIGN KEY CONSTRAINTS

ALTER TABLE payments ADD CONSTRAINT fk_payments_user_id
  FOREIGN KEY (user_id) REFERENCES users(id)
  ON DELETE CASCADE;

ALTER TABLE payments ADD CONSTRAINT fk_payments_organization_id
  FOREIGN KEY (organization_id) REFERENCES organizations(id)
  ON DELETE CASCADE;

ALTER TABLE mass_intentions ADD CONSTRAINT fk_mass_intentions_user_id
  FOREIGN KEY (user_id) REFERENCES users(id)
  ON DELETE CASCADE;

ALTER TABLE mass_intentions ADD CONSTRAINT fk_mass_intentions_organization_id
  FOREIGN KEY (organization_id) REFERENCES organizations(id)
  ON DELETE CASCADE;

ALTER TABLE mass_intentions ADD CONSTRAINT fk_mass_intentions_church_id
  FOREIGN KEY (church_id) REFERENCES churches(id)
  ON DELETE CASCADE;

ALTER TABLE mass_intentions ADD CONSTRAINT fk_mass_intentions_payment_id
  FOREIGN KEY (payment_id) REFERENCES payments(id)
  ON DELETE CASCADE;

ALTER TABLE mass_intentions ADD CONSTRAINT fk_mass_intentions_priest_id
  FOREIGN KEY (priest_id) REFERENCES users(id)
  ON DELETE CASCADE;

ALTER TABLE oremus_candles ADD CONSTRAINT fk_oremus_candles_user_id
  FOREIGN KEY (user_id) REFERENCES users(id)
  ON DELETE CASCADE;

ALTER TABLE oremus_candles ADD CONSTRAINT fk_oremus_candles_organization_id
  FOREIGN KEY (organization_id) REFERENCES organizations(id)
  ON DELETE CASCADE;

-- INDEXES

ALTER TABLE payments ADD PRIMARY KEY (id);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_organization_id ON payments(organization_id);
CREATE INDEX idx_payments_created_at ON payments(created_at);
CREATE INDEX idx_payments_organization_id ON payments(organization_id);
CREATE INDEX idx_payments_user_id ON payments(user_id);

ALTER TABLE mass_intentions ADD PRIMARY KEY (id);
CREATE INDEX idx_mass_intentions_user_id ON mass_intentions(user_id);
CREATE INDEX idx_mass_intentions_organization_id ON mass_intentions(organization_id);
CREATE INDEX idx_mass_intentions_church_id ON mass_intentions(church_id);
CREATE INDEX idx_mass_intentions_payment_id ON mass_intentions(payment_id);
CREATE INDEX idx_mass_intentions_priest_id ON mass_intentions(priest_id);
CREATE INDEX idx_mass_intentions_created_at ON mass_intentions(created_at);
CREATE INDEX idx_mass_intentions_organization_id ON mass_intentions(organization_id);
CREATE INDEX idx_mass_intentions_user_id ON mass_intentions(user_id);

ALTER TABLE oremus_candles ADD PRIMARY KEY (id);
CREATE INDEX idx_oremus_candles_user_id ON oremus_candles(user_id);
CREATE INDEX idx_oremus_candles_organization_id ON oremus_candles(organization_id);
CREATE INDEX idx_oremus_candles_created_at ON oremus_candles(created_at);
CREATE INDEX idx_oremus_candles_organization_id ON oremus_candles(organization_id);
CREATE INDEX idx_oremus_candles_user_id ON oremus_candles(user_id);

-- ROW LEVEL SECURITY

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own data in organization" ON payments

  FOR ALL USING (

    user_id = auth.uid() AND

    organization_id IN (

      SELECT organization_id FROM memberships WHERE user_id = auth.uid()

    )

  );

ALTER TABLE mass_intentions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own data in organization" ON mass_intentions

  FOR ALL USING (

    user_id = auth.uid() AND

    organization_id IN (

      SELECT organization_id FROM memberships WHERE user_id = auth.uid()

    )

  );

ALTER TABLE oremus_candles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own data in organization" ON oremus_candles

  FOR ALL USING (

    user_id = auth.uid() AND

    organization_id IN (

      SELECT organization_id FROM memberships WHERE user_id = auth.uid()

    )

  );

-- TRIGGERS

-- Function to automatically update timestamp
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp_payments
  BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_mass_intentions
  BEFORE UPDATE ON mass_intentions
  FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
