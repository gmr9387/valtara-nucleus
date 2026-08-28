-- ============================================================
-- NUCLEUS ERROR TABLE
-- ============================================================

create table if not exists nucleus_errors (
  id uuid primary key default gen_random_uuid(),
  organization_id text not null,
  subsystem text not null,
  code text not null,
  message text not null,
  context jsonb,
  created_at timestamptz default now()
);

create index if not exists idx_errors_org on nucleus_errors (organization_id);
create index if not exists idx_errors_subsystem on nucleus_errors (subsystem);
