import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  useConnectors as useConnectorsBase,
  useConnectorCapabilities as useConnectorCapabilitiesBase,
  useConnectorBindings as useConnectorBindingsBase,
  useCredentials as useCredentialsBase,
  type ConnectorRow,
  type ConnectorHealthCheckRow,
} from "@/lib/queries";
import { qk } from "@/lib/query-keys";

export type Connector = ConnectorRow;

export const useConnectors = useConnectorsBase;
export const useConnectorCapabilities = useConnectorCapabilitiesBase;
export const useConnectorBindings = useConnectorBindingsBase;
export const useCredentials = useCredentialsBase;

/**
 * Latest connector_health_checks row per binding, keyed by binding id.
 * RLS guarantees only org-scoped rows are returned.
 */
export function useLatestHealthChecks(bindingIds: string[]) {
  const sorted = [...bindingIds].sort();

  return useQuery({
    enabled: sorted.length > 0,
    queryKey: qk.health.latest(sorted),
    queryFn: async (): Promise<Record<string, ConnectorHealthCheckRow>> => {
      const { data, error } = await supabase
        .from("connector_health_checks")
        .select("*")
        .in("connector_binding_id", sorted)
        .order("checked_at", { ascending: false });

      if (error) throw error;

      const map: Record<string, ConnectorHealthCheckRow> = {};
      for (const row of (data ?? []) as ConnectorHealthCheckRow[]) {
        if (!map[row.connector_binding_id]) {
          map[row.connector_binding_id] = row;
        }
      }
      return map;
    },
    staleTime: 15_000,
  });
}
