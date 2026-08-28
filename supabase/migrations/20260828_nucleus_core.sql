-- ============================================================
-- NUCLEUS CONTRACT TABLES
-- ============================================================

create table if not exists opportunity (
  id uuid primary key default gen_random_uuid(),
  organization_id text not null,
  version text not null,
  payload jsonb not null,
  created_at timestamptz default now()
);

create index if not exists idx_opportunity_org on opportunity (organization_id);


create table if not exists recommendation (
  id uuid primary key default gen_random_uuid(),
  organization_id text not null,
  version text not null,
  payload jsonb not null,
  created_at timestamptz default now()
);

create index if not exists idx_recommendation_org on recommendation (organization_id);


create table if not exists authorization (
  id uuid primary key default gen_random_uuid(),
  organization_id text not null,
  version text not null,
  payload jsonb not null,
  created_at timestamptz default now()
);

create index if not exists idx_authorization_org on authorization (organization_id);


create table if not exists execution (
  id uuid primary key default gen_random_uuid(),
  organization_id text not null,
  version text not null,
  payload jsonb not null,
  created_at timestamptz default now()
);

create index if not exists idx_execution_org on execution (organization_id);


create table if not exists payment (
  id uuid primary key default gen_random_uuid(),
  organization_id text not null,
  version text not null,
  payload jsonb not null,
  created_at timestamptz default now()
);

create index if not exists idx_payment_org on payment (organization_id);
