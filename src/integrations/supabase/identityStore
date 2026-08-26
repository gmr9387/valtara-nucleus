/**
 * identityStore.ts
 *
 * Supabase binding for Nucleus identity model.
 */

import { supabase } from "./supabaseClient";
import { NucleusIdentity } from "../identityBinding";

export async function storeIdentity(identity: NucleusIdentity) {
  return await supabase.from("nucleus_identity").insert({
    id: identity.id,
    tenant_id: identity.tenantId,
    project_id: identity.projectId,
    environment: identity.environment,
    actor: identity.actor,
    timestamp: new Date().toISOString()
  });
}
