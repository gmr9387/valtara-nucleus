-- ============================================================
-- CORE PHASE 1 EVENT CONTRACT SEED
-- ============================================================

WITH seed_actor AS (
  SELECT o.created_by AS user_id
  FROM public.organizations o
  ORDER BY o.created_at ASC
  LIMIT 1
)
INSERT INTO public.core_event_contracts (
  event_kind,
  version,
  schema_json,
  compatibility_status,
  registered_by
)
SELECT
  seed.event_kind,
  seed.version,
  seed.schema_json,
  'compatible'::public.core_contract_compatibility,
  actor.user_id
FROM seed_actor actor
CROSS JOIN (
  VALUES
    (
      'dualpay.payout.requested',
      1,
      '{
        "type":"object",
        "allowAdditionalProperties":false,
        "properties":{
          "commandId":{"type":"string","required":true},
          "deduplicated":{"type":"boolean","required":true}
        }
      }'::jsonb
    ),
    (
      'dualpay.payout.requested',
      2,
      '{
        "type":"object",
        "allowAdditionalProperties":false,
        "properties":{
          "commandId":{"type":"string","required":true},
          "deduplicated":{"type":"boolean","required":true},
          "channel":{"type":"string","required":false}
        }
      }'::jsonb
    ),
    (
      'guardian.alert.reviewed',
      1,
      '{
        "type":"object",
        "allowAdditionalProperties":false,
        "properties":{
          "commandId":{"type":"string","required":true},
          "deduplicated":{"type":"boolean","required":true}
        }
      }'::jsonb
    )
) AS seed(event_kind, version, schema_json)
ON CONFLICT (event_kind, version) DO NOTHING;

CREATE OR REPLACE FUNCTION public.seed_core_event_contracts_on_org_create()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.core_event_contracts (
    event_kind,
    version,
    schema_json,
    compatibility_status,
    registered_by
  )
  VALUES
    (
      'dualpay.payout.requested',
      1,
      '{
        "type":"object",
        "allowAdditionalProperties":false,
        "properties":{
          "commandId":{"type":"string","required":true},
          "deduplicated":{"type":"boolean","required":true}
        }
      }'::jsonb,
      'compatible'::public.core_contract_compatibility,
      NEW.created_by
    ),
    (
      'dualpay.payout.requested',
      2,
      '{
        "type":"object",
        "allowAdditionalProperties":false,
        "properties":{
          "commandId":{"type":"string","required":true},
          "deduplicated":{"type":"boolean","required":true},
          "channel":{"type":"string","required":false}
        }
      }'::jsonb,
      'compatible'::public.core_contract_compatibility,
      NEW.created_by
    ),
    (
      'guardian.alert.reviewed',
      1,
      '{
        "type":"object",
        "allowAdditionalProperties":false,
        "properties":{
          "commandId":{"type":"string","required":true},
          "deduplicated":{"type":"boolean","required":true}
        }
      }'::jsonb,
      'compatible'::public.core_contract_compatibility,
      NEW.created_by
    )
  ON CONFLICT (event_kind, version) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_seed_core_event_contracts_on_org_create ON public.organizations;
CREATE TRIGGER trg_seed_core_event_contracts_on_org_create
  AFTER INSERT ON public.organizations
  FOR EACH ROW
  EXECUTE FUNCTION public.seed_core_event_contracts_on_org_create();

REVOKE EXECUTE ON FUNCTION public.seed_core_event_contracts_on_org_create() FROM PUBLIC, anon, authenticated;
