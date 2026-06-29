import { getCoreDbClient } from "@/lib/core/services/db";
import type { CredentialRow, CredentialVersionRow } from "@/lib/queries";

export async function listSecretsMetadata(orgId: string): Promise<CredentialRow[]> {
  const db = getCoreDbClient();

  const { data, error } = await db
    .from("credentials")
    .select(
      "id, organization_id, project_id, environment_id, provider_id, label, status, created_by, last_rotated_at, created_at, updated_at",
    )
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as CredentialRow[];
}

export async function listSecretVersionMetadata(
  credentialId: string,
): Promise<CredentialVersionRow[]> {
  const db = getCoreDbClient();

  const { data, error } = await db
    .from("credential_versions")
    .select(
      "id, credential_id, version_number, redacted_preview, created_by, created_at, is_active",
    )
    .eq("credential_id", credentialId)
    .order("version_number", { ascending: false });

  if (error) throw error;
  return (data ?? []) as CredentialVersionRow[];
}
