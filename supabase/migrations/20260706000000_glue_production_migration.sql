-- ─────────────────────────────────────────────────────────────────────────────
-- Glue Production Migration Sprint
--
-- Makes POST /api/v0/workflows/execute work against the real Supabase schema.
--
-- Changes to workflow_runs:
--   1. Add subject_id TEXT (nullable) — the subject entity this run is about
--   2. Add correlation_id TEXT (nullable initially; unique-indexed per org)
--   3. Add payload JSONB NOT NULL DEFAULT '{}' — the inbound execution payload
--   4. Make created_by nullable — M2M service-role inserts have no auth.uid()
--
-- New indexes:
--   idx_workflow_runs_org_correlation — unique (org, correlation_id) for idempotency
--   idx_workflow_runs_org_version     — composite lookup by org + version
--   idx_workflow_runs_org_status      — composite lookup by org + status
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. New columns ───────────────────────────────────────────────────────────────

ALTER TABLE public.workflow_runs
  ADD COLUMN IF NOT EXISTS subject_id     TEXT,
  ADD COLUMN IF NOT EXISTS correlation_id TEXT,
  ADD COLUMN IF NOT EXISTS payload        JSONB NOT NULL DEFAULT '{}'::jsonb;

-- 2. Allow M2M inserts (no authenticated user) ─────────────────────────────────

ALTER TABLE public.workflow_runs
  ALTER COLUMN created_by DROP NOT NULL;

-- 3. Indexes ───────────────────────────────────────────────────────────────────

-- Unique per-org idempotency index.
-- Partial (WHERE correlation_id IS NOT NULL) so legacy rows without a
-- correlation_id are not affected.
CREATE UNIQUE INDEX IF NOT EXISTS idx_workflow_runs_org_correlation
  ON public.workflow_runs (organization_id, correlation_id)
  WHERE correlation_id IS NOT NULL;

-- Composite index used when filtering runs by org + version.
CREATE INDEX IF NOT EXISTS idx_workflow_runs_org_version
  ON public.workflow_runs (organization_id, version_id);

-- Composite index used when filtering runs by org + status.
CREATE INDEX IF NOT EXISTS idx_workflow_runs_org_status
  ON public.workflow_runs (organization_id, status);
