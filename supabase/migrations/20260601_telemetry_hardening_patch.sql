-- ============================================================
-- VALTARIS CORE TELEMETRY HARDENING PATCH
-- ============================================================

ALTER TABLE public.telemetry_events
  ADD CONSTRAINT telemetry_events_org_fk
  FOREIGN KEY (organization_id)
  REFERENCES public.organizations(id)
  ON DELETE CASCADE;

ALTER TABLE public.telemetry_events
  ADD CONSTRAINT telemetry_events_user_fk
  FOREIGN KEY (user_id)
  REFERENCES auth.users(id)
  ON DELETE SET NULL;

ALTER TABLE public.telemetry_metrics
  ADD CONSTRAINT telemetry_metrics_org_fk
  FOREIGN KEY (organization_id)
  REFERENCES public.organizations(id)
  ON DELETE CASCADE;

ALTER TABLE public.telemetry_metrics
  ADD CONSTRAINT telemetry_metrics_user_fk
  FOREIGN KEY (user_id)
  REFERENCES auth.users(id)
  ON DELETE SET NULL;

ALTER TABLE public.telemetry_traces
  ADD CONSTRAINT telemetry_traces_org_fk
  FOREIGN KEY (organization_id)
  REFERENCES public.organizations(id)
  ON DELETE CASCADE;

ALTER TABLE public.telemetry_traces
  ADD CONSTRAINT telemetry_traces_user_fk
  FOREIGN KEY (user_id)
  REFERENCES auth.users(id)
  ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_telemetry_events_severity_time
  ON public.telemetry_events (severity, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_telemetry_traces_status_time
  ON public.telemetry_traces (status, started_at DESC);

CREATE INDEX IF NOT EXISTS idx_telemetry_metrics_metric_time
  ON public.telemetry_metrics (metric_name, created_at DESC);