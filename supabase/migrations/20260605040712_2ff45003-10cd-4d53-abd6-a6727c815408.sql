CREATE TYPE public.workflow_status AS ENUM ('draft', 'active', 'archived');
CREATE TYPE public.workflow_version_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE public.workflow_run_status AS ENUM ('pending', 'running', 'completed', 'failed', 'cancelled');
CREATE TYPE public.workflow_step_status AS ENUM ('pending', 'running', 'completed', 'failed', 'skipped');

CREATE TABLE public.workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status public.workflow_status NOT NULL DEFAULT 'draft',
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_workflows_org ON public.workflows(organization_id);
CREATE INDEX idx_workflows_status ON public.workflows(status);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workflows TO authenticated;
GRANT ALL ON public.workflows TO service_role;
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workflows_select_members" ON public.workflows FOR SELECT TO authenticated
  USING (public.is_org_member(organization_id, auth.uid()));
CREATE POLICY "workflows_insert_managers" ON public.workflows FOR INSERT TO authenticated
  WITH CHECK (public.has_org_role(organization_id, auth.uid(), ARRAY['owner','admin','manager']::public.app_role[]));
CREATE POLICY "workflows_update_managers" ON public.workflows FOR UPDATE TO authenticated
  USING (public.has_org_role(organization_id, auth.uid(), ARRAY['owner','admin','manager']::public.app_role[]));
CREATE POLICY "workflows_delete_admins" ON public.workflows FOR DELETE TO authenticated
  USING (public.has_org_role(organization_id, auth.uid(), ARRAY['owner','admin']::public.app_role[]));

CREATE TABLE public.workflow_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES public.workflows(id) ON DELETE CASCADE,
  version_number INT NOT NULL,
  status public.workflow_version_status NOT NULL DEFAULT 'draft',
  definition_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at TIMESTAMPTZ,
  UNIQUE (workflow_id, version_number)
);
CREATE INDEX idx_workflow_versions_workflow ON public.workflow_versions(workflow_id);
CREATE INDEX idx_workflow_versions_status ON public.workflow_versions(status);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workflow_versions TO authenticated;
GRANT ALL ON public.workflow_versions TO service_role;
ALTER TABLE public.workflow_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workflow_versions_select_members" ON public.workflow_versions FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.workflows w WHERE w.id = workflow_id AND public.is_org_member(w.organization_id, auth.uid())));
CREATE POLICY "workflow_versions_insert_managers" ON public.workflow_versions FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.workflows w WHERE w.id = workflow_id AND public.has_org_role(w.organization_id, auth.uid(), ARRAY['owner','admin','manager']::public.app_role[])));
CREATE POLICY "workflow_versions_update_managers" ON public.workflow_versions FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.workflows w WHERE w.id = workflow_id AND public.has_org_role(w.organization_id, auth.uid(), ARRAY['owner','admin','manager']::public.app_role[])));
CREATE POLICY "workflow_versions_delete_admins" ON public.workflow_versions FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.workflows w WHERE w.id = workflow_id AND public.has_org_role(w.organization_id, auth.uid(), ARRAY['owner','admin']::public.app_role[])));

CREATE OR REPLACE FUNCTION public.workflow_version_guard()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF OLD.status = 'published' THEN
    IF NEW.definition_json IS DISTINCT FROM OLD.definition_json
       OR NEW.version_number IS DISTINCT FROM OLD.version_number
       OR NEW.workflow_id IS DISTINCT FROM OLD.workflow_id THEN
      RAISE EXCEPTION 'Published workflow versions are immutable';
    END IF;
    IF NEW.status NOT IN ('published','archived') THEN
      RAISE EXCEPTION 'Published version can only transition to archived';
    END IF;
  END IF;
  IF NEW.status = 'published' AND OLD.status <> 'published' AND NEW.published_at IS NULL THEN
    NEW.published_at := now();
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_workflow_version_guard BEFORE UPDATE ON public.workflow_versions
FOR EACH ROW EXECUTE FUNCTION public.workflow_version_guard();

CREATE TABLE public.workflow_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES public.workflows(id) ON DELETE CASCADE,
  version_id UUID NOT NULL REFERENCES public.workflow_versions(id) ON DELETE RESTRICT,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  status public.workflow_run_status NOT NULL DEFAULT 'pending',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  input_json JSONB,
  output_json JSONB,
  error_json JSONB,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_workflow_runs_workflow ON public.workflow_runs(workflow_id);
CREATE INDEX idx_workflow_runs_org ON public.workflow_runs(organization_id);
CREATE INDEX idx_workflow_runs_status ON public.workflow_runs(status);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workflow_runs TO authenticated;
GRANT ALL ON public.workflow_runs TO service_role;
ALTER TABLE public.workflow_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workflow_runs_select_members" ON public.workflow_runs FOR SELECT TO authenticated
  USING (public.is_org_member(organization_id, auth.uid()));
CREATE POLICY "workflow_runs_insert_operators" ON public.workflow_runs FOR INSERT TO authenticated
  WITH CHECK (public.has_org_role(organization_id, auth.uid(), ARRAY['owner','admin','manager','operator']::public.app_role[]));
CREATE POLICY "workflow_runs_update_operators" ON public.workflow_runs FOR UPDATE TO authenticated
  USING (public.has_org_role(organization_id, auth.uid(), ARRAY['owner','admin','manager','operator']::public.app_role[]));
CREATE POLICY "workflow_runs_delete_admins" ON public.workflow_runs FOR DELETE TO authenticated
  USING (public.has_org_role(organization_id, auth.uid(), ARRAY['owner','admin']::public.app_role[]));

CREATE OR REPLACE FUNCTION public.workflow_run_guard()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE wf_status public.workflow_status;
BEGIN
  IF TG_OP = 'INSERT' THEN
    SELECT status INTO wf_status FROM public.workflows WHERE id = NEW.workflow_id;
    IF wf_status = 'archived' THEN
      RAISE EXCEPTION 'Cannot start runs for archived workflows';
    END IF;
    RETURN NEW;
  END IF;
  IF TG_OP = 'UPDATE' THEN
    IF OLD.status IN ('completed','failed','cancelled') THEN
      RAISE EXCEPTION 'Terminal workflow runs are immutable';
    END IF;
    NEW.updated_at := now();
    RETURN NEW;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_workflow_run_guard BEFORE INSERT OR UPDATE ON public.workflow_runs
FOR EACH ROW EXECUTE FUNCTION public.workflow_run_guard();

CREATE TABLE public.workflow_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID NOT NULL REFERENCES public.workflow_runs(id) ON DELETE CASCADE,
  step_key TEXT NOT NULL,
  status public.workflow_step_status NOT NULL DEFAULT 'pending',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  input_json JSONB,
  output_json JSONB,
  error_json JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (run_id, step_key)
);
CREATE INDEX idx_workflow_steps_run ON public.workflow_steps(run_id);
CREATE INDEX idx_workflow_steps_status ON public.workflow_steps(status);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workflow_steps TO authenticated;
GRANT ALL ON public.workflow_steps TO service_role;
ALTER TABLE public.workflow_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workflow_steps_select_members" ON public.workflow_steps FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.workflow_runs r WHERE r.id = run_id AND public.is_org_member(r.organization_id, auth.uid())));
CREATE POLICY "workflow_steps_insert_operators" ON public.workflow_steps FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.workflow_runs r WHERE r.id = run_id AND public.has_org_role(r.organization_id, auth.uid(), ARRAY['owner','admin','manager','operator']::public.app_role[])));
CREATE POLICY "workflow_steps_update_operators" ON public.workflow_steps FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.workflow_runs r WHERE r.id = run_id AND public.has_org_role(r.organization_id, auth.uid(), ARRAY['owner','admin','manager','operator']::public.app_role[])));
CREATE POLICY "workflow_steps_delete_admins" ON public.workflow_steps FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.workflow_runs r WHERE r.id = run_id AND public.has_org_role(r.organization_id, auth.uid(), ARRAY['owner','admin']::public.app_role[])));

CREATE OR REPLACE FUNCTION public.workflow_step_touch()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at := now(); RETURN NEW; END;
$$;
CREATE TRIGGER trg_workflow_step_touch BEFORE UPDATE ON public.workflow_steps
FOR EACH ROW EXECUTE FUNCTION public.workflow_step_touch();

CREATE TABLE public.workflow_audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  workflow_id UUID REFERENCES public.workflows(id) ON DELETE SET NULL,
  run_id UUID REFERENCES public.workflow_runs(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  actor_id UUID REFERENCES auth.users(id),
  payload JSONB,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_workflow_audit_org ON public.workflow_audit_events(organization_id);
CREATE INDEX idx_workflow_audit_run ON public.workflow_audit_events(run_id);
CREATE INDEX idx_workflow_audit_workflow ON public.workflow_audit_events(workflow_id);
GRANT SELECT, INSERT ON public.workflow_audit_events TO authenticated;
GRANT ALL ON public.workflow_audit_events TO service_role;
ALTER TABLE public.workflow_audit_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workflow_audit_select_members" ON public.workflow_audit_events FOR SELECT TO authenticated
  USING (public.is_org_member(organization_id, auth.uid()));
CREATE POLICY "workflow_audit_insert_members" ON public.workflow_audit_events FOR INSERT TO authenticated
  WITH CHECK (public.is_org_member(organization_id, auth.uid()));

CREATE OR REPLACE FUNCTION public.workflow_touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at := now(); RETURN NEW; END;
$$;
CREATE TRIGGER trg_workflows_touch BEFORE UPDATE ON public.workflows
FOR EACH ROW EXECUTE FUNCTION public.workflow_touch_updated_at();