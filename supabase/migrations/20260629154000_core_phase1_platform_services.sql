-- ============================================================
-- VALTARIS CORE PHASE 1 PLATFORM SERVICES
-- ============================================================

CREATE TYPE public.core_command_status AS ENUM (
  'pending',
  'completed',
  'failed'
);

CREATE TYPE public.core_contract_compatibility AS ENUM (
  'compatible',
  'breaking',
  'deprecated',
  'experimental'
);

CREATE TABLE public.core_commands (
  command_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  actor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  command_type TEXT NOT NULL,
  idempotency_key TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  status public.core_command_status NOT NULL DEFAULT 'pending',
  result JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  UNIQUE (org_id, command_type, idempotency_key)
);

CREATE INDEX idx_core_commands_org_created
  ON public.core_commands (org_id, created_at DESC);

CREATE INDEX idx_core_commands_actor_created
  ON public.core_commands (actor_id, created_at DESC);

GRANT SELECT, INSERT, UPDATE ON public.core_commands TO authenticated;
GRANT ALL ON public.core_commands TO service_role;
ALTER TABLE public.core_commands ENABLE ROW LEVEL SECURITY;

CREATE POLICY core_commands_select_org_members ON public.core_commands
  FOR SELECT TO authenticated
  USING (public.is_org_member(org_id, auth.uid()));

CREATE POLICY core_commands_insert_org_operators ON public.core_commands
  FOR INSERT TO authenticated
  WITH CHECK (
    actor_id = auth.uid()
    AND public.has_org_role(org_id, auth.uid(), ARRAY['owner','admin','manager','operator']::public.app_role[])
  );

CREATE POLICY core_commands_update_org_operators ON public.core_commands
  FOR UPDATE TO authenticated
  USING (public.has_org_role(org_id, auth.uid(), ARRAY['owner','admin','manager','operator']::public.app_role[]));

CREATE TABLE public.core_event_contracts (
  event_kind TEXT NOT NULL,
  version INTEGER NOT NULL CHECK (version > 0),
  schema_json JSONB NOT NULL,
  compatibility_status public.core_contract_compatibility NOT NULL DEFAULT 'compatible',
  registered_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (event_kind, version)
);

CREATE INDEX idx_core_event_contracts_kind_created
  ON public.core_event_contracts (event_kind, created_at DESC);

GRANT SELECT, INSERT ON public.core_event_contracts TO authenticated;
GRANT ALL ON public.core_event_contracts TO service_role;
ALTER TABLE public.core_event_contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY core_event_contracts_select_authenticated ON public.core_event_contracts
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY core_event_contracts_insert_admins ON public.core_event_contracts
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.organization_members m
      WHERE m.user_id = auth.uid()
        AND m.role IN ('owner', 'admin')
    )
    AND registered_by = auth.uid()
  );

CREATE TABLE public.core_audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  actor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  event_kind TEXT NOT NULL,
  event_version INTEGER NOT NULL,
  subject_type TEXT NOT NULL,
  subject_id TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  correlation_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  FOREIGN KEY (event_kind, event_version)
    REFERENCES public.core_event_contracts(event_kind, version)
    ON DELETE RESTRICT
);

CREATE INDEX idx_core_audit_events_org_created
  ON public.core_audit_events (org_id, created_at DESC);

CREATE INDEX idx_core_audit_events_kind_version
  ON public.core_audit_events (event_kind, event_version, created_at DESC);

GRANT SELECT, INSERT ON public.core_audit_events TO authenticated;
GRANT ALL ON public.core_audit_events TO service_role;
ALTER TABLE public.core_audit_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY core_audit_events_select_org_members ON public.core_audit_events
  FOR SELECT TO authenticated
  USING (public.is_org_member(org_id, auth.uid()));

CREATE POLICY core_audit_events_insert_org_members ON public.core_audit_events
  FOR INSERT TO authenticated
  WITH CHECK (
    actor_id = auth.uid()
    AND public.is_org_member(org_id, auth.uid())
  );

CREATE OR REPLACE FUNCTION public.core_audit_events_immutable()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RAISE EXCEPTION 'core_audit_events is append-only';
END;
$$;

CREATE TRIGGER trg_core_audit_events_no_update
  BEFORE UPDATE ON public.core_audit_events
  FOR EACH ROW
  EXECUTE FUNCTION public.core_audit_events_immutable();

CREATE TRIGGER trg_core_audit_events_no_delete
  BEFORE DELETE ON public.core_audit_events
  FOR EACH ROW
  EXECUTE FUNCTION public.core_audit_events_immutable();

REVOKE EXECUTE ON FUNCTION public.core_audit_events_immutable() FROM PUBLIC, anon, authenticated;
