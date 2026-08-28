-- ============================================================
-- NUCLEUS SUBSYSTEM REGISTRY
-- ============================================================

create table if not exists nucleus_subsystems (
  id text primary key,
  organization_id text not null,
  runtime boolean default false,
  definition boolean default false,
  health boolean default false,
  telemetry boolean default false,
  events boolean default false,
  contracts boolean default false,
  created_at timestamptz default now()
);

create index if not exists idx_subsystems_org on nucleus_subsystems (organization_id);
