import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CredentialProvider {
  id: string;
  key: string;
  label: string;
  category: string;
  supports_rotation: boolean;
  supports_oauth: boolean;
}

export interface Connector {
  id: string;
  key: string;
  label: string;
  category: string;
  status: "available" | "beta" | "deprecated";
  documentation_url: string | null;
  supports_webhooks: boolean;
  supports_oauth: boolean;
}

export interface ConnectorCapability {
  id: string;
  connector_id: string;
  capability_key: string;
  capability_label: string;
}

export interface ConnectorVersion {
  id: string;
  connector_id: string;
  version: string;
  changelog: string | null;
  schema_version: number;
  created_at: string;
}

export interface CredentialRow {
  id: string;
  organization_id: string;
  provider_id: string;
  project_id: string | null;
  environment_id: string | null;
  label: string;
  status: "active" | "rotating" | "deactivated";
  last_rotated_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CredentialVersionPreview {
  id: string;
  credential_id: string;
  version_number: number;
  redacted_preview: string | null;
  is_active: boolean;
  created_at: string;
}

export interface ConnectorBinding {
  id: string;
  organization_id: string;
  connector_id: string;
  credential_id: string | null;
  project_id: string | null;
  environment_id: string | null;
  status: "active" | "paused" | "error";
  created_at: string;
  updated_at: string;
}

export interface HealthCheck {
  id: string;
  connector_binding_id: string;
  health_status: "healthy" | "degraded" | "failed" | "unknown";
  checked_at: string;
  latency_ms: number | null;
  message: string | null;
}

export function useCredentialProviders() {
  return useQuery({
    queryKey: ["credential-providers"],
    queryFn: async (): Promise<CredentialProvider[]> => {
      const { data, error } = await supabase
        .from("credential_providers")
        .select("*")
        .order("label");
      if (error) throw error;
      return (data ?? []) as CredentialProvider[];
    },
    staleTime: 5 * 60_000,
  });
}

export function useConnectors() {
  return useQuery({
    queryKey: ["connectors"],
    queryFn: async (): Promise<Connector[]> => {
      const { data, error } = await supabase
        .from("connectors")
        .select("*")
        .order("label");
      if (error) throw error;
      return (data ?? []) as Connector[];
    },
    staleTime: 5 * 60_000,
  });
}

export function useConnectorCapabilities() {
  return useQuery({
    queryKey: ["connector-capabilities"],
    queryFn: async (): Promise<ConnectorCapability[]> => {
      const { data, error } = await supabase
        .from("connector_capabilities")
        .select("*");
      if (error) throw error;
      return (data ?? []) as ConnectorCapability[];
    },
    staleTime: 5 * 60_000,
  });
}

export function useConnectorVersions(connectorId: string | null) {
  return useQuery({
    enabled: !!connectorId,
    queryKey: ["connector-versions", connectorId],
    queryFn: async (): Promise<ConnectorVersion[]> => {
      const { data, error } = await supabase
        .from("connector_versions")
        .select("*")
        .eq("connector_id", connectorId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as ConnectorVersion[];
    },
  });
}

export function useCredentials(orgId: string | null) {
  return useQuery({
    enabled: !!orgId,
    queryKey: ["credentials", orgId],
    queryFn: async (): Promise<CredentialRow[]> => {
      const { data, error } = await supabase
        .from("credentials")
        .select("*")
        .eq("organization_id", orgId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as CredentialRow[];
    },
    staleTime: 30_000,
  });
}

export function useCredentialVersions(credentialId: string | null) {
  return useQuery({
    enabled: !!credentialId,
    queryKey: ["credential-versions", credentialId],
    queryFn: async (): Promise<CredentialVersionPreview[]> => {
      const { data, error } = await supabase
        .from("credential_versions")
        .select("id, credential_id, version_number, redacted_preview, is_active, created_at")
        .eq("credential_id", credentialId!)
        .order("version_number", { ascending: false });
      if (error) throw error;
      return (data ?? []) as CredentialVersionPreview[];
    },
  });
}

export function useConnectorBindings(orgId: string | null) {
  return useQuery({
    enabled: !!orgId,
    queryKey: ["connector-bindings", orgId],
    queryFn: async (): Promise<ConnectorBinding[]> => {
      const { data, error } = await supabase
        .from("connector_bindings")
        .select("*")
        .eq("organization_id", orgId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as ConnectorBinding[];
    },
    staleTime: 30_000,
  });
}

export function useLatestHealthChecks(bindingIds: string[]) {
  return useQuery({
    enabled: bindingIds.length > 0,
    queryKey: ["health-checks", bindingIds.slice().sort().join(",")],
    queryFn: async (): Promise<Record<string, HealthCheck>> => {
      const { data, error } = await supabase
        .from("connector_health_checks")
        .select("*")
        .in("connector_binding_id", bindingIds)
        .order("checked_at", { ascending: false });
      if (error) throw error;
      const latest: Record<string, HealthCheck> = {};
      for (const row of (data ?? []) as HealthCheck[]) {
        if (!latest[row.connector_binding_id]) {
          latest[row.connector_binding_id] = row;
        }
      }
      return latest;
    },
    staleTime: 15_000,
  });
}
