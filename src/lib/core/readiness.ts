/**
 * ValtariOS Core — Operations Readiness Query
 *
 * Aggregates platform-substrate counts for the current organization.
 * Pure read; respects RLS via the browser supabase client.
 *
 * NOTE: does not invent inference logic. Reflects only what Core
 * already owns: orgs, projects, environments, secrets, connectors,
 * workflows, telemetry, audit.
 */

import { useQuery } from "@tanstack/react-query";
import { buildOperationsReadiness } from "@/lib/core/services/readiness-operations";
import { fetchCoreReadinessCounts } from "@/lib/core/services/readiness-query-adapter";
import type { OperationsReadiness } from "@/lib/core/services/readiness-operations";
export type {
  AreaReadiness,
  OperationsReadiness,
  ReadinessLevel,
} from "@/lib/core/services/readiness-operations";

export function useOperationsReadiness(orgId: string | null) {
  return useQuery({
    enabled: !!orgId,
    queryKey: ["core-readiness", orgId],
    staleTime: 15_000,
    queryFn: async (): Promise<OperationsReadiness> => {
      const counts = await fetchCoreReadinessCounts(orgId!);
      return buildOperationsReadiness({ orgId: orgId!, counts });
    },
  });
}
