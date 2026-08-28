-- ============================================================
-- NUCLEUS LINEAGE TABLE
-- ============================================================

create table if not exists nucleus_lineage (
  id uuid primary key default gen_random_uuid(),
  organization_id text not null,
  chain jsonb not null,
  finalized boolean default false,
  created_at timestamptz default now(),
  finalized_at timestamptz
);

create index if not exists idx_lineage_org on nucleus_lineage (organization_id);
