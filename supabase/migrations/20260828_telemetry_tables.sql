-- ============================================================
-- NUCLEUS TELEMETRY TABLES
-- ============================================================

create table if not exists nucleus_telemetry (
  id uuid primary key default gen_random_uuid(),
  organization_id text not null,
  subsystem text not null,
  level text not null,
  message text not null,
  metadata jsonb,
  created_at timestamptz default now()
);

create index if not exists idx_telemetry_org on nucleus_telemetry (organization_id);
create index if not exists idx_telemetry_subsystem on nucleus_telemetry (subsystem);
