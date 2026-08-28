-- ============================================================
-- NUCLEUS EVENT LOG
-- ============================================================

create table if not exists nucleus_events (
  id uuid primary key default gen_random_uuid(),
  organization_id text not null,
  subsystem text not null,
  name text not null,
  version text not null,
  payload jsonb not null,
  created_at timestamptz default now()
);

create index if not exists idx_events_org on nucleus_events (organization_id);
create index if not exists idx_events_subsystem on nucleus_events (subsystem);
create index if not exists idx_events_name on nucleus_events (name);
