-- ============================================================
-- LOYRIA — Schéma base de données PostgreSQL / Supabase
-- Version : 1.0 — 2026-05-27
-- ============================================================

-- ============================================================
-- TYPES ÉNUMÉRÉS
-- ============================================================

CREATE TYPE user_profile_type AS ENUM (
  'particulier', 'investisseur', 'sci', 'gestionnaire', 'autre'
);

CREATE TYPE property_type AS ENUM (
  'appartement', 'maison', 'studio', 'immeuble',
  'parking', 'garage', 'local_commercial', 'autre'
);

CREATE TYPE property_status AS ENUM (
  'loue', 'vacant', 'en_travaux', 'en_recherche', 'vendu', 'archive'
);

CREATE TYPE ownership_type AS ENUM (
  'nom_propre', 'sci', 'indivision', 'societe'
);

CREATE TYPE tax_regime AS ENUM (
  'micro_foncier', 'reel', 'lmnp', 'sci', 'autre'
);

CREATE TYPE tenant_status AS ENUM (
  'actif', 'sorti', 'candidat', 'archive'
);

CREATE TYPE lease_type AS ENUM (
  'location_nue', 'location_meublee', 'bail_etudiant',
  'bail_mobilite', 'colocation', 'bail_commercial'
);

CREATE TYPE lease_status AS ENUM (
  'brouillon', 'actif', 'en_attente_signature',
  'resilie', 'expire', 'archive'
);

CREATE TYPE reference_index AS ENUM ('irl', 'icc', 'ilat');

CREATE TYPE rent_status AS ENUM (
  'attendu', 'paye', 'partiellement_paye', 'en_retard',
  'relance', 'litige', 'annule', 'regularise'
);

CREATE TYPE payment_method AS ENUM (
  'virement', 'cheque', 'especes', 'prelevement', 'autre'
);

CREATE TYPE reminder_level AS ENUM (
  'rappel_amiable', 'deuxieme_relance', 'mise_en_demeure'
);

CREATE TYPE reminder_channel AS ENUM ('email', 'courrier', 'sms');

CREATE TYPE document_category AS ENUM (
  'bail', 'etat_des_lieux', 'dpe', 'diagnostic',
  'assurance_habitation', 'assurance_pno', 'quittance', 'recu',
  'charges', 'travaux', 'facture', 'taxe_fonciere',
  'fiscalite', 'copropriete', 'identite_locataire', 'garant', 'autre'
);

CREATE TYPE generated_document_type AS ENUM (
  'quittance', 'recu_partiel', 'courrier_relance',
  'courrier_revision', 'courrier_regularisation'
);

CREATE TYPE work_type AS ENUM (
  'reparation', 'renovation', 'entretien', 'amelioration', 'urgence'
);

CREATE TYPE work_status AS ENUM (
  'planifie', 'en_cours', 'termine', 'annule'
);

CREATE TYPE alert_type AS ENUM (
  'loyer_en_retard', 'assurance_expirante', 'dpe_expirant',
  'diagnostic_expirant', 'revision_loyer', 'fin_bail',
  'regularisation_charges', 'taxe_fonciere', 'travaux_prevus',
  'document_manquant', 'vacance_locative', 'rappel_personnalise'
);

CREATE TYPE alert_importance AS ENUM ('faible', 'normale', 'urgente', 'critique');

CREATE TYPE alert_status AS ENUM ('a_faire', 'en_cours', 'fait', 'ignore');

CREATE TYPE access_role AS ENUM ('lecture', 'ecriture', 'admin');

CREATE TYPE access_status AS ENUM ('en_attente', 'accepte', 'refuse', 'expire');

CREATE TYPE subscription_plan AS ENUM (
  'gratuit', 'essentiel', 'premium', 'professionnel'
);

CREATE TYPE subscription_status AS ENUM (
  'trial', 'active', 'past_due', 'canceled', 'expired'
);

CREATE TYPE organization_type AS ENUM (
  'sci', 'indivision', 'societe', 'autre'
);

CREATE TYPE org_member_role AS ENUM ('admin', 'membre', 'lecteur');

CREATE TYPE work_document_type AS ENUM ('devis', 'facture', 'photo', 'autre');

-- ============================================================
-- MODULE 1 — UTILISATEURS ET COMPTES
-- ============================================================

-- Profil étendu (auth.users est géré par Supabase)
CREATE TABLE profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name    TEXT,
  last_name     TEXT,
  phone         TEXT,
  address       TEXT,
  city          TEXT,
  postal_code   TEXT,
  country       TEXT DEFAULT 'FR',
  profile_type  user_profile_type DEFAULT 'particulier',
  avatar_url    TEXT,
  notification_preferences JSONB DEFAULT '{}',
  onboarding_completed     BOOLEAN DEFAULT FALSE,
  onboarding_step          INT DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Organisations (SCI, indivision, etc.)
CREATE TABLE organizations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  type        organization_type NOT NULL,
  siren       TEXT,
  owner_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Membres d'une organisation
CREATE TABLE organization_members (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role            org_member_role NOT NULL DEFAULT 'membre',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (organization_id, user_id)
);

-- ============================================================
-- MODULE ABONNEMENTS
-- ============================================================

CREATE TABLE subscriptions (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan                    subscription_plan NOT NULL DEFAULT 'gratuit',
  status                  subscription_status NOT NULL DEFAULT 'trial',
  current_period_start    TIMESTAMPTZ,
  current_period_end      TIMESTAMPTZ,
  max_properties          INT NOT NULL DEFAULT 1,
  max_storage_gb          DECIMAL(5,2) NOT NULL DEFAULT 0.5,
  stripe_subscription_id  TEXT,
  stripe_customer_id      TEXT,
  created_at              TIMESTAMPTZ DEFAULT NOW(),
  updated_at              TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id)
);

-- ============================================================
-- MODULE 4 — BIENS IMMOBILIERS
-- ============================================================

CREATE TABLE properties (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id          UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  organization_id   UUID REFERENCES organizations(id) ON DELETE SET NULL,
  name              TEXT NOT NULL,
  address           TEXT NOT NULL,
  city              TEXT NOT NULL,
  postal_code       TEXT NOT NULL,
  country           TEXT DEFAULT 'FR',
  type              property_type NOT NULL DEFAULT 'appartement',
  surface           DECIMAL(8,2),
  rooms_count       INT,
  bedrooms_count    INT,
  floor             INT,
  has_elevator      BOOLEAN DEFAULT FALSE,
  is_furnished      BOOLEAN DEFAULT FALSE,
  status            property_status NOT NULL DEFAULT 'vacant',

  -- Informations patrimoniales
  purchase_date         DATE,
  purchase_price        DECIMAL(12,2),
  notary_fees           DECIMAL(10,2),
  agency_fees           DECIMAL(10,2),
  initial_works_cost    DECIMAL(10,2),
  estimated_value       DECIMAL(12,2),
  tax_regime            tax_regime DEFAULT 'micro_foncier',
  ownership_type        ownership_type DEFAULT 'nom_propre',
  property_tax          DECIMAL(10,2), -- taxe foncière annuelle
  condo_charges         DECIMAL(8,2),  -- charges copropriété mensuelles

  photos  JSONB DEFAULT '[]',
  notes   TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Assurances PNO liées au bien
CREATE TABLE property_insurances (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id     UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  type            TEXT NOT NULL DEFAULT 'pno',
  insurer         TEXT,
  policy_number   TEXT,
  start_date      DATE,
  end_date        DATE,
  annual_premium  DECIMAL(8,2),
  document_id     UUID, -- FK vers documents, défini après
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Crédits immobiliers liés au bien
CREATE TABLE property_loans (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id      UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  bank_name        TEXT,
  loan_amount      DECIMAL(12,2),
  monthly_payment  DECIMAL(8,2),
  interest_rate    DECIMAL(5,3),
  start_date       DATE,
  end_date         DATE,
  notes            TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- MODULE 5 — LOCATAIRES
-- ============================================================

CREATE TABLE tenants (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id              UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  first_name            TEXT NOT NULL,
  last_name             TEXT NOT NULL,
  email                 TEXT,
  phone                 TEXT,
  previous_address      TEXT,
  profession            TEXT,
  employer              TEXT,
  declared_income       DECIMAL(10,2),
  deposit_amount        DECIMAL(8,2),
  insurance_company     TEXT,
  insurance_policy_number TEXT,
  insurance_expiry_date DATE,
  status                tenant_status NOT NULL DEFAULT 'actif',
  notes                 TEXT,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

-- Garants
CREATE TABLE guarantors (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id        UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  first_name       TEXT NOT NULL,
  last_name        TEXT NOT NULL,
  email            TEXT,
  phone            TEXT,
  profession       TEXT,
  declared_income  DECIMAL(10,2),
  notes            TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- MODULE 6 — BAUX
-- ============================================================

CREATE TABLE leases (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id         UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  owner_id            UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type                lease_type NOT NULL DEFAULT 'location_nue',
  start_date          DATE NOT NULL,
  duration_months     INT,
  end_date            DATE,
  auto_renewal        BOOLEAN DEFAULT TRUE,
  rent_amount         DECIMAL(8,2) NOT NULL, -- HC
  charges_amount      DECIMAL(8,2) DEFAULT 0,
  total_rent          DECIMAL(8,2) NOT NULL, -- CC
  deposit_amount      DECIMAL(8,2),
  payment_day         INT DEFAULT 1 CHECK (payment_day BETWEEN 1 AND 31),
  index_clause        BOOLEAN DEFAULT TRUE,
  reference_index     reference_index DEFAULT 'irl',
  last_revision_date  DATE,
  next_revision_date  DATE,
  status              lease_status NOT NULL DEFAULT 'brouillon',
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Relation bail ↔ locataires (colocation possible)
CREATE TABLE lease_tenants (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lease_id    UUID NOT NULL REFERENCES leases(id) ON DELETE CASCADE,
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  is_primary  BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (lease_id, tenant_id)
);

-- ============================================================
-- MODULE 7 — LOYERS ET PAIEMENTS
-- ============================================================

-- Échéances mensuelles de loyer (générées automatiquement à l'activation du bail)
CREATE TABLE rents (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lease_id         UUID NOT NULL REFERENCES leases(id) ON DELETE CASCADE,
  property_id      UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  due_date         DATE NOT NULL,
  period_start     DATE NOT NULL,
  period_end       DATE NOT NULL,
  expected_amount  DECIMAL(8,2) NOT NULL,
  charges_amount   DECIMAL(8,2) DEFAULT 0,
  total_expected   DECIMAL(8,2) NOT NULL,
  paid_amount      DECIMAL(8,2) DEFAULT 0,
  status           rent_status NOT NULL DEFAULT 'attendu',
  notes            TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Paiements reçus pour un loyer
CREATE TABLE payments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rent_id           UUID NOT NULL REFERENCES rents(id) ON DELETE CASCADE,
  amount            DECIMAL(8,2) NOT NULL,
  payment_date      DATE NOT NULL,
  received_date     DATE,
  payment_method    payment_method DEFAULT 'virement',
  reference         TEXT,
  receipt_generated BOOLEAN DEFAULT FALSE,
  notes             TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Relances envoyées
CREATE TABLE reminders (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rent_id     UUID NOT NULL REFERENCES rents(id) ON DELETE CASCADE,
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  sent_by     UUID NOT NULL REFERENCES profiles(id),
  level       reminder_level NOT NULL,
  channel     reminder_channel NOT NULL DEFAULT 'email',
  sent_at     TIMESTAMPTZ DEFAULT NOW(),
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- MODULE 8 — DOCUMENTS GÉNÉRÉS
-- ============================================================

CREATE TABLE generated_documents (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rent_id         UUID REFERENCES rents(id) ON DELETE CASCADE,
  lease_id        UUID REFERENCES leases(id) ON DELETE CASCADE,
  type            generated_document_type NOT NULL,
  document_number TEXT,
  file_url        TEXT,
  generated_at    TIMESTAMPTZ DEFAULT NOW(),
  sent_at         TIMESTAMPTZ,
  sent_to_email   TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- MODULE 9 — DOCUMENTS (GED)
-- ============================================================

CREATE TABLE documents (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  property_id  UUID REFERENCES properties(id) ON DELETE SET NULL,
  tenant_id    UUID REFERENCES tenants(id) ON DELETE SET NULL,
  lease_id     UUID REFERENCES leases(id) ON DELETE SET NULL,
  work_id      UUID, -- FK vers works, défini après
  name         TEXT NOT NULL,
  category     document_category NOT NULL DEFAULT 'autre',
  file_url     TEXT NOT NULL,
  file_size    INT,
  mime_type    TEXT,
  document_date DATE,
  expiry_date  DATE,
  tags         TEXT[] DEFAULT '{}',
  notes        TEXT,
  is_archived  BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- FK différées (insurance → document)
ALTER TABLE property_insurances
  ADD CONSTRAINT fk_insurance_document
  FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE SET NULL;

-- ============================================================
-- MODULE TRAVAUX
-- ============================================================

CREATE TABLE works (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id      UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  owner_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title            TEXT NOT NULL,
  description      TEXT,
  type             work_type NOT NULL DEFAULT 'reparation',
  status           work_status NOT NULL DEFAULT 'planifie',
  planned_date     DATE,
  completion_date  DATE,
  estimated_cost   DECIMAL(10,2),
  actual_cost      DECIMAL(10,2),
  provider_name    TEXT,
  notes            TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- FK différée (documents → work)
ALTER TABLE documents
  ADD CONSTRAINT fk_document_work
  FOREIGN KEY (work_id) REFERENCES works(id) ON DELETE SET NULL;

CREATE TABLE work_documents (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_id      UUID NOT NULL REFERENCES works(id) ON DELETE CASCADE,
  document_id  UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  type         work_document_type DEFAULT 'autre',
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (work_id, document_id)
);

-- ============================================================
-- MODULE 10 — ALERTES ET ÉCHÉANCES
-- ============================================================

CREATE TABLE alerts (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id            UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  property_id         UUID REFERENCES properties(id) ON DELETE CASCADE,
  lease_id            UUID REFERENCES leases(id) ON DELETE CASCADE,
  tenant_id           UUID REFERENCES tenants(id) ON DELETE CASCADE,
  document_id         UUID REFERENCES documents(id) ON DELETE SET NULL,
  type                alert_type NOT NULL,
  title               TEXT NOT NULL,
  description         TEXT,
  due_date            DATE NOT NULL,
  importance          alert_importance NOT NULL DEFAULT 'normale',
  status              alert_status NOT NULL DEFAULT 'a_faire',
  reminder_days_before INT[] DEFAULT '{30,7,1}',
  last_notified_at    TIMESTAMPTZ,
  is_auto_generated   BOOLEAN DEFAULT FALSE,
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications in-app
CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  alert_id    UUID REFERENCES alerts(id) ON DELETE SET NULL,
  type        TEXT NOT NULL,
  title       TEXT NOT NULL,
  body        TEXT,
  is_read     BOOLEAN DEFAULT FALSE,
  read_at     TIMESTAMPTZ,
  action_url  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ACCÈS COLLABORATEURS
-- ============================================================

CREATE TABLE property_access (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id       UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  owner_id          UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  collaborator_id   UUID REFERENCES profiles(id) ON DELETE CASCADE,
  invite_email      TEXT,
  role              access_role NOT NULL DEFAULT 'lecture',
  status            access_status NOT NULL DEFAULT 'en_attente',
  invited_at        TIMESTAMPTZ DEFAULT NOW(),
  accepted_at       TIMESTAMPTZ,
  expires_at        TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT chk_collaborator_or_email
    CHECK (collaborator_id IS NOT NULL OR invite_email IS NOT NULL)
);

-- ============================================================
-- INDEXES
-- ============================================================

-- Biens
CREATE INDEX idx_properties_owner      ON properties(owner_id);
CREATE INDEX idx_properties_status     ON properties(status);

-- Baux
CREATE INDEX idx_leases_property       ON leases(property_id);
CREATE INDEX idx_leases_status         ON leases(status);
CREATE INDEX idx_leases_end_date       ON leases(end_date);
CREATE INDEX idx_leases_next_revision  ON leases(next_revision_date);

-- Locataires
CREATE INDEX idx_tenants_owner         ON tenants(owner_id);
CREATE INDEX idx_tenants_status        ON tenants(status);

-- Loyers
CREATE INDEX idx_rents_lease           ON rents(lease_id);
CREATE INDEX idx_rents_status          ON rents(status);
CREATE INDEX idx_rents_due_date        ON rents(due_date);

-- Paiements
CREATE INDEX idx_payments_rent         ON payments(rent_id);
CREATE INDEX idx_payments_date         ON payments(payment_date);

-- Documents
CREATE INDEX idx_documents_owner       ON documents(owner_id);
CREATE INDEX idx_documents_property    ON documents(property_id);
CREATE INDEX idx_documents_category    ON documents(category);
CREATE INDEX idx_documents_expiry      ON documents(expiry_date);

-- Alertes
CREATE INDEX idx_alerts_owner          ON alerts(owner_id);
CREATE INDEX idx_alerts_property       ON alerts(property_id);
CREATE INDEX idx_alerts_status         ON alerts(status);
CREATE INDEX idx_alerts_due_date       ON alerts(due_date);
CREATE INDEX idx_alerts_type           ON alerts(type);

-- Notifications
CREATE INDEX idx_notifications_user    ON notifications(user_id);
CREATE INDEX idx_notifications_unread  ON notifications(user_id, is_read) WHERE is_read = FALSE;

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE profiles             ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations        ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties           ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_insurances  ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_loans       ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants              ENABLE ROW LEVEL SECURITY;
ALTER TABLE guarantors           ENABLE ROW LEVEL SECURITY;
ALTER TABLE leases               ENABLE ROW LEVEL SECURITY;
ALTER TABLE lease_tenants        ENABLE ROW LEVEL SECURITY;
ALTER TABLE rents                ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments             ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders            ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents            ENABLE ROW LEVEL SECURITY;
ALTER TABLE works                ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_documents       ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts               ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications        ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_access      ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_documents  ENABLE ROW LEVEL SECURITY;

-- Politique de base : chaque utilisateur ne voit que ses propres données
-- (les politiques complètes tenant compte des collaborateurs seront ajoutées en Phase 3)

CREATE POLICY "profiles: own" ON profiles
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "properties: own" ON properties
  FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "tenants: own" ON tenants
  FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "leases: own" ON leases
  FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "rents: via lease owner" ON rents
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM leases l
      WHERE l.id = rents.lease_id AND l.owner_id = auth.uid()
    )
  );

CREATE POLICY "payments: via rent" ON payments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM rents r
      JOIN leases l ON l.id = r.lease_id
      WHERE r.id = payments.rent_id AND l.owner_id = auth.uid()
    )
  );

CREATE POLICY "documents: own" ON documents
  FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "works: own" ON works
  FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "alerts: own" ON alerts
  FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "notifications: own" ON notifications
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "subscriptions: own" ON subscriptions
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Mise à jour automatique de updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_tenants_updated_at
  BEFORE UPDATE ON tenants
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_leases_updated_at
  BEFORE UPDATE ON leases
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_rents_updated_at
  BEFORE UPDATE ON rents
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_works_updated_at
  BEFORE UPDATE ON works
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_alerts_updated_at
  BEFORE UPDATE ON alerts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Création automatique d'un profil à l'inscription
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id) VALUES (NEW.id);
  INSERT INTO subscriptions (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Mise à jour automatique du montant payé sur rents quand un paiement est ajouté
CREATE OR REPLACE FUNCTION update_rent_paid_amount()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE rents SET
    paid_amount = (
      SELECT COALESCE(SUM(amount), 0)
      FROM payments WHERE rent_id = NEW.rent_id
    ),
    status = CASE
      WHEN (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE rent_id = NEW.rent_id) = 0
        THEN 'attendu'
      WHEN (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE rent_id = NEW.rent_id) >= total_expected
        THEN 'paye'
      ELSE 'partiellement_paye'
    END
  WHERE id = NEW.rent_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_payment_update_rent
  AFTER INSERT OR UPDATE OR DELETE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_rent_paid_amount();
