import { supabase } from "@/integrations/supabase/client";

export type AuditAction =
  | "create" | "update" | "delete" | "invite" | "remove"
  | "switch_org" | "sign_in" | "sign_up" | "sign_out" | "view";

export interface AuditPayload {
  organization_id?: string | null;
  module: string;
  entity_type: string;
  entity_id?: string | null;
  action: AuditAction;
  before?: unknown;
  after?: unknown;
  correlation_id?: string;
}

export async function logAudit(p: AuditPayload) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("audit_events").insert({
    organization_id: p.organization_id ?? null,
    user_id: user.id,
    module: p.module,
    entity_type: p.entity_type,
    entity_id: p.entity_id ?? null,
    action: p.action,
    before_json: (p.before ?? null) as never,
    after_json: (p.after ?? null) as never,
    correlation_id: p.correlation_id ?? null,
  });
}
