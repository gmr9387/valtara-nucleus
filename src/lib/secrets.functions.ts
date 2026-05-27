import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  createCredentialSchema,
  rotateCredentialSchema,
  deactivateCredentialSchema,
  buildRedactedPreview,
} from "@/lib/schemas";

/**
 * Server-only contract for credential write operations.
 *
 * These functions are the only authorized path to write credential material.
 * Raw secret bytes never traverse the browser bundle, never appear in TanStack
 * Query caches, and never enter `audit_events` payloads.
 *
 * The current implementation stores an opaque `encrypted_payload_ref` which is
 * a server-generated identifier. Phase 3 will swap the reference resolution
 * for a real KMS (Supabase Vault / AWS KMS / GCP KMS) without changing this
 * function contract or any downstream caller.
 */

function makePayloadRef(): string {
  // Opaque, non-reversible reference. KMS integration replaces this body.
  return `kms_pending:${crypto.randomUUID()}`;
}

export const createSecret = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => createCredentialSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // RLS enforces that only owners/admins may insert.
    const credIns = await supabase
      .from("credentials")
      .insert({
        organization_id: data.organization_id,
        provider_id: data.provider_id,
        project_id: data.project_id ?? null,
        environment_id: data.environment_id ?? null,
        label: data.label,
        status: "active",
        created_by: userId,
        last_rotated_at: new Date().toISOString(),
      })
      .select()
      .single();
    if (credIns.error) throw new Error(credIns.error.message);

    const versionIns = await supabase
      .from("credential_versions")
      .insert({
        credential_id: credIns.data.id,
        version_number: 1,
        encrypted_payload_ref: makePayloadRef(),
        redacted_preview: buildRedactedPreview(data.initial_secret),
        created_by: userId,
        is_active: true,
      })
      .select()
      .single();
    if (versionIns.error) throw new Error(versionIns.error.message);

    await supabase.from("credential_rotation_events").insert({
      credential_id: credIns.data.id,
      previous_version_id: null,
      next_version_id: versionIns.data.id,
      rotation_reason: "initial",
      triggered_by: userId,
    });

    await supabase.from("audit_events").insert({
      organization_id: data.organization_id,
      user_id: userId,
      module: "secrets",
      entity_type: "credential",
      entity_id: credIns.data.id,
      action: "create",
      after_json: { label: data.label, provider_id: data.provider_id, version: 1 },
    });

    return { credential_id: credIns.data.id, version_id: versionIns.data.id };
  });

export const rotateSecret = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => rotateCredentialSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const cred = await supabase
      .from("credentials")
      .select("id, organization_id")
      .eq("id", data.credential_id)
      .single();
    if (cred.error) throw new Error(cred.error.message);

    const prev = await supabase
      .from("credential_versions")
      .select("id, version_number")
      .eq("credential_id", data.credential_id)
      .eq("is_active", true)
      .maybeSingle();
    if (prev.error) throw new Error(prev.error.message);

    // Deactivate current to satisfy unique-active constraint.
    if (prev.data) {
      const deact = await supabase
        .from("credential_versions")
        .update({ is_active: false })
        .eq("id", prev.data.id);
      if (deact.error) throw new Error(deact.error.message);
    }

    const nextNumber = (prev.data?.version_number ?? 0) + 1;
    const versionIns = await supabase
      .from("credential_versions")
      .insert({
        credential_id: data.credential_id,
        version_number: nextNumber,
        encrypted_payload_ref: makePayloadRef(),
        redacted_preview: buildRedactedPreview(data.new_secret),
        created_by: userId,
        is_active: true,
      })
      .select()
      .single();
    if (versionIns.error) throw new Error(versionIns.error.message);

    await supabase
      .from("credentials")
      .update({ last_rotated_at: new Date().toISOString(), status: "active" })
      .eq("id", data.credential_id);

    await supabase.from("credential_rotation_events").insert({
      credential_id: data.credential_id,
      previous_version_id: prev.data?.id ?? null,
      next_version_id: versionIns.data.id,
      rotation_reason: data.reason,
      triggered_by: userId,
    });

    await supabase.from("audit_events").insert({
      organization_id: cred.data.organization_id,
      user_id: userId,
      module: "secrets",
      entity_type: "credential",
      entity_id: data.credential_id,
      action: "rotate_secret",
      after_json: { version: nextNumber, reason: data.reason },
    });

    return { version_id: versionIns.data.id, version_number: nextNumber };
  });

export const deactivateSecret = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => deactivateCredentialSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const cred = await supabase
      .from("credentials")
      .select("id, organization_id")
      .eq("id", data.credential_id)
      .single();
    if (cred.error) throw new Error(cred.error.message);

    const upd = await supabase
      .from("credentials")
      .update({ status: "deactivated" })
      .eq("id", data.credential_id);
    if (upd.error) throw new Error(upd.error.message);

    await supabase
      .from("credential_versions")
      .update({ is_active: false })
      .eq("credential_id", data.credential_id)
      .eq("is_active", true);

    await supabase.from("audit_events").insert({
      organization_id: cred.data.organization_id,
      user_id: userId,
      module: "secrets",
      entity_type: "credential",
      entity_id: data.credential_id,
      action: "delete",
      after_json: { status: "deactivated" },
    });

    return { ok: true };
  });
