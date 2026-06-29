import { getCoreDbClient } from "@/lib/core/services/db";
import type {
  ConnectorBindingRow,
  ConnectorCapabilityRow,
  ConnectorRow,
  CredentialProviderRow,
  CredentialRow,
} from "@/lib/queries";

export async function listCredentialProviders(): Promise<CredentialProviderRow[]> {
  const db = getCoreDbClient();

  const { data, error } = await db
    .from("credential_providers")
    .select("*")
    .order("label", { ascending: true });

  if (error) throw error;
  return (data ?? []) as CredentialProviderRow[];
}

export async function listConnectors(): Promise<ConnectorRow[]> {
  const db = getCoreDbClient();

  const { data, error } = await db
    .from("connectors")
    .select("*")
    .order("label", { ascending: true });

  if (error) throw error;
  return (data ?? []) as ConnectorRow[];
}

export async function listConnectorCapabilities(): Promise<ConnectorCapabilityRow[]> {
  const db = getCoreDbClient();

  const { data, error } = await db
    .from("connector_capabilities")
    .select("*")
    .order("capability_label", { ascending: true });

  if (error) throw error;
  return (data ?? []) as ConnectorCapabilityRow[];
}

export async function listConnectorBindings(orgId: string): Promise<ConnectorBindingRow[]> {
  const db = getCoreDbClient();

  const { data, error } = await db
    .from("connector_bindings")
    .select("*")
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as ConnectorBindingRow[];
}

export async function listCredentials(orgId: string): Promise<CredentialRow[]> {
  const db = getCoreDbClient();

  const { data, error } = await db
    .from("credentials")
    .select("*")
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as CredentialRow[];
}
