
-- =========================
-- ENUMS
-- =========================
CREATE TYPE public.credential_status AS ENUM ('active','rotating','deactivated');
CREATE TYPE public.connector_category AS ENUM ('ai','payments','messaging','social','database','universal','other');
CREATE TYPE public.connector_status AS ENUM ('available','beta','deprecated');
CREATE TYPE public.binding_status AS ENUM ('active','paused','error');
CREATE TYPE public.health_status AS ENUM ('healthy','degraded','failed','unknown');
CREATE TYPE public.rotation_reason AS ENUM ('scheduled','manual','compromised','policy','initial');

-- =========================
-- CREDENTIAL PROVIDERS (catalog)
-- =========================
CREATE TABLE public.credential_providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  label text NOT NULL,
  category public.connector_category NOT NULL DEFAULT 'other',
  supports_rotation boolean NOT NULL DEFAULT true,
  supports_oauth boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.credential_providers TO authenticated;
GRANT ALL ON public.credential_providers TO service_role;
ALTER TABLE public.credential_providers ENABLE ROW LEVEL SECURITY;
CREATE POLICY providers_select_all ON public.credential_providers FOR SELECT TO authenticated USING (true);

-- =========================
-- CREDENTIALS
-- =========================
CREATE TABLE public.credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  project_id uuid NULL,
  environment_id uuid NULL,
  provider_id uuid NOT NULL REFERENCES public.credential_providers(id) ON DELETE RESTRICT,
  label text NOT NULL,
  status public.credential_status NOT NULL DEFAULT 'active',
  created_by uuid NOT NULL,
  last_rotated_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_credentials_org ON public.credentials(organization_id);
CREATE INDEX idx_credentials_project ON public.credentials(project_id);
CREATE INDEX idx_credentials_env ON public.credentials(environment_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.credentials TO authenticated;
GRANT ALL ON public.credentials TO service_role;
ALTER TABLE public.credentials ENABLE ROW LEVEL SECURITY;

-- Owners/admins/managers can read credential metadata (no payloads anywhere on this table).
CREATE POLICY credentials_select_mgrs ON public.credentials FOR SELECT TO authenticated
USING (public.has_org_role(organization_id, auth.uid(), ARRAY['owner'::app_role,'admin'::app_role,'manager'::app_role]));

CREATE POLICY credentials_insert_admins ON public.credentials FOR INSERT TO authenticated
WITH CHECK (public.has_org_role(organization_id, auth.uid(), ARRAY['owner'::app_role,'admin'::app_role]));

CREATE POLICY credentials_update_admins ON public.credentials FOR UPDATE TO authenticated
USING (public.has_org_role(organization_id, auth.uid(), ARRAY['owner'::app_role,'admin'::app_role]));

CREATE POLICY credentials_delete_admins ON public.credentials FOR DELETE TO authenticated
USING (public.has_org_role(organization_id, auth.uid(), ARRAY['owner'::app_role,'admin'::app_role]));

CREATE TRIGGER touch_credentials BEFORE UPDATE ON public.credentials
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- =========================
-- CREDENTIAL VERSIONS
-- =========================
CREATE TABLE public.credential_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  credential_id uuid NOT NULL REFERENCES public.credentials(id) ON DELETE CASCADE,
  version_number integer NOT NULL,
  encrypted_payload_ref text NOT NULL,
  redacted_preview text NULL,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  is_active boolean NOT NULL DEFAULT false,
  UNIQUE (credential_id, version_number)
);
CREATE INDEX idx_cv_cred ON public.credential_versions(credential_id);
CREATE UNIQUE INDEX uniq_active_version_per_credential
  ON public.credential_versions(credential_id) WHERE is_active;

-- Column-level grants: metadata visible to authenticated, payload ref only to service_role.
GRANT SELECT (id, credential_id, version_number, redacted_preview, created_by, created_at, is_active)
  ON public.credential_versions TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.credential_versions TO authenticated;
GRANT ALL ON public.credential_versions TO service_role;
ALTER TABLE public.credential_versions ENABLE ROW LEVEL SECURITY;

-- RLS scoped via parent credential's organization
CREATE POLICY cv_select_mgrs ON public.credential_versions FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.credentials c
  WHERE c.id = credential_id
    AND public.has_org_role(c.organization_id, auth.uid(), ARRAY['owner'::app_role,'admin'::app_role,'manager'::app_role])
));

CREATE POLICY cv_insert_admins ON public.credential_versions FOR INSERT TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM public.credentials c
  WHERE c.id = credential_id
    AND public.has_org_role(c.organization_id, auth.uid(), ARRAY['owner'::app_role,'admin'::app_role])
));

CREATE POLICY cv_update_admins ON public.credential_versions FOR UPDATE TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.credentials c
  WHERE c.id = credential_id
    AND public.has_org_role(c.organization_id, auth.uid(), ARRAY['owner'::app_role,'admin'::app_role])
));

-- =========================
-- CREDENTIAL ROTATION EVENTS
-- =========================
CREATE TABLE public.credential_rotation_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  credential_id uuid NOT NULL REFERENCES public.credentials(id) ON DELETE CASCADE,
  previous_version_id uuid NULL REFERENCES public.credential_versions(id) ON DELETE SET NULL,
  next_version_id uuid NULL REFERENCES public.credential_versions(id) ON DELETE SET NULL,
  rotation_reason public.rotation_reason NOT NULL DEFAULT 'manual',
  triggered_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_cre_cred ON public.credential_rotation_events(credential_id);
GRANT SELECT, INSERT ON public.credential_rotation_events TO authenticated;
GRANT ALL ON public.credential_rotation_events TO service_role;
ALTER TABLE public.credential_rotation_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY cre_select_mgrs ON public.credential_rotation_events FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.credentials c WHERE c.id = credential_id
    AND public.has_org_role(c.organization_id, auth.uid(), ARRAY['owner'::app_role,'admin'::app_role,'manager'::app_role])
));

CREATE POLICY cre_insert_admins ON public.credential_rotation_events FOR INSERT TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM public.credentials c WHERE c.id = credential_id
    AND public.has_org_role(c.organization_id, auth.uid(), ARRAY['owner'::app_role,'admin'::app_role])
));

-- =========================
-- CONNECTORS (catalog)
-- =========================
CREATE TABLE public.connectors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  label text NOT NULL,
  category public.connector_category NOT NULL DEFAULT 'other',
  status public.connector_status NOT NULL DEFAULT 'available',
  documentation_url text NULL,
  supports_webhooks boolean NOT NULL DEFAULT false,
  supports_oauth boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.connectors TO authenticated;
GRANT ALL ON public.connectors TO service_role;
ALTER TABLE public.connectors ENABLE ROW LEVEL SECURITY;
CREATE POLICY connectors_select_all ON public.connectors FOR SELECT TO authenticated USING (true);

-- =========================
-- CONNECTOR VERSIONS
-- =========================
CREATE TABLE public.connector_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  connector_id uuid NOT NULL REFERENCES public.connectors(id) ON DELETE CASCADE,
  version text NOT NULL,
  changelog text NULL,
  schema_version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (connector_id, version)
);
GRANT SELECT ON public.connector_versions TO authenticated;
GRANT ALL ON public.connector_versions TO service_role;
ALTER TABLE public.connector_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY cversions_select_all ON public.connector_versions FOR SELECT TO authenticated USING (true);

-- =========================
-- CONNECTOR CAPABILITIES
-- =========================
CREATE TABLE public.connector_capabilities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  connector_id uuid NOT NULL REFERENCES public.connectors(id) ON DELETE CASCADE,
  capability_key text NOT NULL,
  capability_label text NOT NULL,
  UNIQUE (connector_id, capability_key)
);
GRANT SELECT ON public.connector_capabilities TO authenticated;
GRANT ALL ON public.connector_capabilities TO service_role;
ALTER TABLE public.connector_capabilities ENABLE ROW LEVEL SECURITY;
CREATE POLICY ccaps_select_all ON public.connector_capabilities FOR SELECT TO authenticated USING (true);

-- =========================
-- CONNECTOR BINDINGS
-- =========================
CREATE TABLE public.connector_bindings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  project_id uuid NULL,
  environment_id uuid NULL,
  connector_id uuid NOT NULL REFERENCES public.connectors(id) ON DELETE RESTRICT,
  credential_id uuid NULL REFERENCES public.credentials(id) ON DELETE SET NULL,
  status public.binding_status NOT NULL DEFAULT 'active',
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_cb_org ON public.connector_bindings(organization_id);
CREATE INDEX idx_cb_connector ON public.connector_bindings(connector_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.connector_bindings TO authenticated;
GRANT ALL ON public.connector_bindings TO service_role;
ALTER TABLE public.connector_bindings ENABLE ROW LEVEL SECURITY;

CREATE POLICY cb_select_members ON public.connector_bindings FOR SELECT TO authenticated
USING (public.is_org_member(organization_id, auth.uid()));

CREATE POLICY cb_insert_admins ON public.connector_bindings FOR INSERT TO authenticated
WITH CHECK (public.has_org_role(organization_id, auth.uid(), ARRAY['owner'::app_role,'admin'::app_role]));

CREATE POLICY cb_update_admins ON public.connector_bindings FOR UPDATE TO authenticated
USING (public.has_org_role(organization_id, auth.uid(), ARRAY['owner'::app_role,'admin'::app_role]));

CREATE POLICY cb_delete_admins ON public.connector_bindings FOR DELETE TO authenticated
USING (public.has_org_role(organization_id, auth.uid(), ARRAY['owner'::app_role,'admin'::app_role]));

CREATE TRIGGER touch_bindings BEFORE UPDATE ON public.connector_bindings
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- =========================
-- CONNECTOR HEALTH CHECKS
-- =========================
CREATE TABLE public.connector_health_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  connector_binding_id uuid NOT NULL REFERENCES public.connector_bindings(id) ON DELETE CASCADE,
  health_status public.health_status NOT NULL DEFAULT 'unknown',
  checked_at timestamptz NOT NULL DEFAULT now(),
  latency_ms integer NULL,
  message text NULL
);
CREATE INDEX idx_chc_binding ON public.connector_health_checks(connector_binding_id, checked_at DESC);
GRANT SELECT, INSERT ON public.connector_health_checks TO authenticated;
GRANT ALL ON public.connector_health_checks TO service_role;
ALTER TABLE public.connector_health_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY chc_select_members ON public.connector_health_checks FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.connector_bindings b
  WHERE b.id = connector_binding_id AND public.is_org_member(b.organization_id, auth.uid())
));

CREATE POLICY chc_insert_admins ON public.connector_health_checks FOR INSERT TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM public.connector_bindings b
  WHERE b.id = connector_binding_id
    AND public.has_org_role(b.organization_id, auth.uid(), ARRAY['owner'::app_role,'admin'::app_role,'manager'::app_role])
));

-- =========================
-- SEED PROVIDERS + CONNECTORS
-- =========================
INSERT INTO public.credential_providers (key, label, category, supports_rotation, supports_oauth) VALUES
  ('openai','OpenAI','ai',true,false),
  ('stripe','Stripe','payments',true,false),
  ('twilio','Twilio','messaging',true,false),
  ('meta','Meta','social',true,true),
  ('supabase','Supabase','database',true,false),
  ('generic_rest','Generic REST','universal',true,false),
  ('generic_webhook','Generic Webhook','universal',false,false)
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.connectors (key, label, category, status, documentation_url, supports_webhooks, supports_oauth) VALUES
  ('openai','OpenAI','ai','available','https://platform.openai.com/docs',false,false),
  ('stripe','Stripe','payments','available','https://stripe.com/docs/api',true,false),
  ('twilio','Twilio','messaging','available','https://www.twilio.com/docs',true,false),
  ('meta','Meta','social','beta','https://developers.facebook.com/docs',true,true),
  ('supabase','Supabase','database','available','https://supabase.com/docs',false,false),
  ('generic_rest','Generic REST','universal','available',NULL,false,false),
  ('generic_webhook','Generic Webhook','universal','available',NULL,true,false)
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.connector_versions (connector_id, version, changelog, schema_version)
SELECT id, 'v1', 'Initial registry entry', 1 FROM public.connectors
ON CONFLICT DO NOTHING;

INSERT INTO public.connector_capabilities (connector_id, capability_key, capability_label) VALUES
  ((SELECT id FROM public.connectors WHERE key='openai'), 'chat_completion', 'Chat completion'),
  ((SELECT id FROM public.connectors WHERE key='openai'), 'embeddings', 'Embeddings'),
  ((SELECT id FROM public.connectors WHERE key='openai'), 'classification', 'Classification'),
  ((SELECT id FROM public.connectors WHERE key='stripe'), 'payment_intent', 'Payment intent'),
  ((SELECT id FROM public.connectors WHERE key='stripe'), 'subscription', 'Subscription'),
  ((SELECT id FROM public.connectors WHERE key='stripe'), 'invoice', 'Invoice'),
  ((SELECT id FROM public.connectors WHERE key='twilio'), 'sms_send', 'SMS send'),
  ((SELECT id FROM public.connectors WHERE key='twilio'), 'voice_call', 'Voice call'),
  ((SELECT id FROM public.connectors WHERE key='meta'), 'page_post', 'Page post'),
  ((SELECT id FROM public.connectors WHERE key='meta'), 'insights', 'Insights'),
  ((SELECT id FROM public.connectors WHERE key='supabase'), 'table_query', 'Table query'),
  ((SELECT id FROM public.connectors WHERE key='supabase'), 'storage_object', 'Storage object'),
  ((SELECT id FROM public.connectors WHERE key='generic_rest'), 'http_request', 'HTTP request'),
  ((SELECT id FROM public.connectors WHERE key='generic_webhook'), 'webhook_delivery', 'Webhook delivery'),
  ((SELECT id FROM public.connectors WHERE key='generic_webhook'), 'webhook_receive', 'Webhook receive')
ON CONFLICT DO NOTHING;
