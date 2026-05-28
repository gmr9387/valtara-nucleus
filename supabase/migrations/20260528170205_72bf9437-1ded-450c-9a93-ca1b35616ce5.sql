
-- Enums
CREATE TYPE public.telemetry_severity AS ENUM ('debug', 'info', 'warn', 'error', 'critical');
CREATE TYPE public.telemetry_span_status AS ENUM ('ok', 'error', 'cancelled', 'unset');

-- telemetry_events
CREATE TABLE public.telemetry_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NULL,
  user_id UUID NULL,
  module TEXT NOT NULL,
  event_type TEXT NOT NULL,
  severity public.telemetry_severity NOT NULL DEFAULT 'info',
  trace_id UUID NULL,
  span_id UUID NULL,
  correlation_id UUID NULL,
  message TEXT NULL,
  attributes_json JSONB NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_telemetry_events_org_time ON public.telemetry_events (organization_id, created_at DESC);
CREATE INDEX idx_telemetry_events_trace ON public.telemetry_events (trace_id);
CREATE INDEX idx_telemetry_events_module ON public.telemetry_events (module, event_type);

GRANT SELECT, INSERT ON public.telemetry_events TO authenticated;
GRANT ALL ON public.telemetry_events TO service_role;

ALTER TABLE public.telemetry_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY te_select_org_or_self ON public.telemetry_events
  FOR SELECT TO authenticated
  USING (
    (organization_id IS NOT NULL AND public.is_org_member(organization_id, auth.uid()))
    OR (organization_id IS NULL AND user_id = auth.uid())
  );

CREATE POLICY te_insert_self ON public.telemetry_events
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND (organization_id IS NULL OR public.is_org_member(organization_id, auth.uid()))
  );

-- telemetry_metrics
CREATE TABLE public.telemetry_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NULL,
  user_id UUID NULL,
  module TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  metric_value DOUBLE PRECISION NOT NULL,
  unit TEXT NULL,
  attributes_json JSONB NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_telemetry_metrics_org_time ON public.telemetry_metrics (organization_id, created_at DESC);
CREATE INDEX idx_telemetry_metrics_name ON public.telemetry_metrics (module, metric_name);

GRANT SELECT, INSERT ON public.telemetry_metrics TO authenticated;
GRANT ALL ON public.telemetry_metrics TO service_role;

ALTER TABLE public.telemetry_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY tm_select_org_or_self ON public.telemetry_metrics
  FOR SELECT TO authenticated
  USING (
    (organization_id IS NOT NULL AND public.is_org_member(organization_id, auth.uid()))
    OR (organization_id IS NULL AND user_id = auth.uid())
  );

CREATE POLICY tm_insert_self ON public.telemetry_metrics
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND (organization_id IS NULL OR public.is_org_member(organization_id, auth.uid()))
  );

-- telemetry_traces
CREATE TABLE public.telemetry_traces (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NULL,
  user_id UUID NULL,
  trace_id UUID NOT NULL,
  span_id UUID NOT NULL,
  parent_span_id UUID NULL,
  name TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ NULL,
  duration_ms INTEGER NULL,
  status public.telemetry_span_status NOT NULL DEFAULT 'unset',
  attributes_json JSONB NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_telemetry_traces_trace ON public.telemetry_traces (trace_id);
CREATE INDEX idx_telemetry_traces_org_time ON public.telemetry_traces (organization_id, started_at DESC);

GRANT SELECT, INSERT ON public.telemetry_traces TO authenticated;
GRANT ALL ON public.telemetry_traces TO service_role;

ALTER TABLE public.telemetry_traces ENABLE ROW LEVEL SECURITY;

CREATE POLICY tt_select_org_or_self ON public.telemetry_traces
  FOR SELECT TO authenticated
  USING (
    (organization_id IS NOT NULL AND public.is_org_member(organization_id, auth.uid()))
    OR (organization_id IS NULL AND user_id = auth.uid())
  );

CREATE POLICY tt_insert_self ON public.telemetry_traces
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND (organization_id IS NULL OR public.is_org_member(organization_id, auth.uid()))
  );
