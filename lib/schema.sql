-- Mediacorp Relationship Hub schema.
--
-- Organizations span 7 categories (Advertiser, Agency, Distributor,
-- TalentAgency, ProductionHouse, Sponsor, LocationPartner). Engagements
-- unify 5 distinct relationship types (ad campaigns, content licensing,
-- talent bookings, sponsorships, DOOH partnerships) behind one table with
-- a `type` discriminator and a JSONB properties bag, so a single Kanban UI
-- (driven by the universal `phase` column) can represent every domain while
-- each still keeps its authentic stage vocabulary and type-specific fields.
-- Tickets cover 4 real Mediacorp support channels (meWATCH, Broadcast,
-- Advertiser, Corporate).

CREATE TABLE IF NOT EXISTS organizations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  industry TEXT,
  hq_city TEXT,
  website TEXT,
  agency_of_record TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contacts (
  id TEXT PRIMARY KEY,
  org_id TEXT REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  title TEXT,
  email TEXT,
  phone TEXT,
  is_talent BOOLEAN NOT NULL DEFAULT false,
  talent_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS engagements (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  org_id TEXT REFERENCES organizations(id) ON DELETE CASCADE,
  secondary_org_id TEXT REFERENCES organizations(id) ON DELETE SET NULL,
  contact_id TEXT REFERENCES contacts(id) ON DELETE SET NULL,
  stage TEXT NOT NULL,
  phase TEXT NOT NULL,
  value_sgd NUMERIC NOT NULL DEFAULT 0,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  properties JSONB NOT NULL DEFAULT '{}',
  owner TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tickets (
  id TEXT PRIMARY KEY,
  channel TEXT NOT NULL,
  category TEXT,
  subject TEXT NOT NULL,
  body TEXT,
  requester_name TEXT,
  requester_contact TEXT,
  org_id TEXT REFERENCES organizations(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'New',
  priority TEXT NOT NULL DEFAULT 'Medium',
  assignee TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  engagement_id TEXT REFERENCES engagements(id) ON DELETE CASCADE,
  ticket_id TEXT REFERENCES tickets(id) ON DELETE CASCADE,
  org_id TEXT REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  due_date TIMESTAMPTZ,
  done BOOLEAN NOT NULL DEFAULT false,
  owner TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notes (
  id TEXT PRIMARY KEY,
  engagement_id TEXT REFERENCES engagements(id) ON DELETE CASCADE,
  ticket_id TEXT REFERENCES tickets(id) ON DELETE CASCADE,
  org_id TEXT REFERENCES organizations(id) ON DELETE CASCADE,
  contact_id TEXT REFERENCES contacts(id) ON DELETE SET NULL,
  body TEXT NOT NULL,
  author TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS activity_log (
  id TEXT PRIMARY KEY,
  actor TEXT NOT NULL,
  summary TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
