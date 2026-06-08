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
import { supabase } from "@/integrations/supabase/client";

export type ReadinessLevel = "ready" | "partial" | "absent" | "unknown";

export interface AreaReadiness {
  key: string;
  label: string;
  level: ReadinessLevel;
  primary: number;
  detail: string;
}

export interface OperationsReadiness {
  orgScopeId: string;
  areas: AreaReadiness[];
}

interface RawCounts {
  projects: number;
  environments: number;
  credentials: number;
  credentialsActive: number;
  credentialsRotating: number;
  bindings: number;
  bindingsActive: number;
  bindingsError: number;
  workflows: number;
  workflowsActive: number;
  workflowRunsRecent: number;
  workflowRunsFailed: number;
  telemetryEvents24h: number;
  auditEvents24h: number;
}

async function countExact(
  table:
    | "projects"
    | "environments"
    | "credentials"
    | "connector_bindings"
    | "workflows"
    | "workflow_runs"
    | "telemetry_events"
    | "audit_events",
  filter: (q: ReturnType<typeof supabase.from>) => unknown,
): Promise<number> {
  const base = supabase.from(table).select("id", { count: "exact", head: true });
  const q = filter(base as never) as { count: number | null; error: unknown };
  // The chain returns a thenable; await via Promise.resolve.
  const { count, error } = (await q) as { count: number | null; error: unknown };
  if (error) throw error;
  return count ?? 0;
}

export function useOperationsReadiness(orgId: string | null) {
  return useQuery({
    enabled: !!orgId,
    queryKey: ["core-readiness", orgId],
    staleTime: 15_000,
    queryFn: async (): Promise<OperationsReadiness> => {
      const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      const [
        projects,
        environmentsViaJoin,
        credentialsAll,
        credentialsActive,
        credentialsRotating,
        bindings,
        bindingsActive,
        bindingsError,
        workflows,
        workflowsActive,
        workflowRunsRecent,
        workflowRunsFailed,
        telemetryEvents24h,
        auditEvents24h,
      ] = await Promise.all([
        supabase.from("projects").select("id", { count: "exact", head: true }).eq("organization_id", orgId!),
        supabase.from("environments").select("id, projects!inner(organization_id)", { count: "exact", head: true }).eq("projects.organization_id", orgId!),
        supabase.from("credentials").select("id", { count: "exact", head: true }).eq("organization_id", orgId!),
        supabase.from("credentials").select("id", { count: "exact", head: true }).eq("organization_id", orgId!).eq("status", "active"),
        supabase.from("credentials").select("id", { count: "exact", head: true }).eq("organization_id", orgId!).eq("status", "rotating"),
        supabase.from("connector_bindings").select("id", { count: "exact", head: true }).eq("organization_id", orgId!),
        supabase.from("connector_bindings").select("id", { count: "exact", head: true }).eq("organization_id", orgId!).eq("status", "active"),
        supabase.from("connector_bindings").select("id", { count: "exact", head: true }).eq("organization_id", orgId!).eq("status", "error"),
        supabase.from("workflows").select("id", { count: "exact", head: true }).eq("organization_id", orgId!),
        supabase.from("workflows").select("id", { count: "exact", head: true }).eq("organization_id", orgId!).eq("status", "active"),
        supabase.from("workflow_runs").select("id", { count: "exact", head: true }).eq("organization_id", orgId!).gte("created_at", since24h),
        supabase.from("workflow_runs").select("id", { count: "exact", head: true }).eq("organization_id", orgId!).eq("status", "failed").gte("created_at", since24h),
        supabase.from("telemetry_events").select("id", { count: "exact", head: true }).eq("organization_id", orgId!).gte("occurred_at", since24h),
        supabase.from("audit_events").select("id", { count: "exact", head: true }).eq("organization_id", orgId!).gte("created_at", since24h),
      ]);

      const errs = [
        projects.error, environmentsViaJoin.error, credentialsAll.error, credentialsActive.error,
        credentialsRotating.error, bindings.error, bindingsActive.error, bindingsError.error,
        workflows.error, workflowsActive.error, workflowRunsRecent.error, workflowRunsFailed.error,
        telemetryEvents24h.error, auditEvents24h.error,
      ].filter(Boolean);
      if (errs.length > 0) throw errs[0];

      const raw: RawCounts = {
        projects: projects.count ?? 0,
        environments: environmentsViaJoin.count ?? 0,
        credentials: credentialsAll.count ?? 0,
        credentialsActive: credentialsActive.count ?? 0,
        credentialsRotating: credentialsRotating.count ?? 0,
        bindings: bindings.count ?? 0,
        bindingsActive: bindingsActive.count ?? 0,
        bindingsError: bindingsError.count ?? 0,
        workflows: workflows.count ?? 0,
        workflowsActive: workflowsActive.count ?? 0,
        workflowRunsRecent: workflowRunsRecent.count ?? 0,
        workflowRunsFailed: workflowRunsFailed.count ?? 0,
        telemetryEvents24h: telemetryEvents24h.count ?? 0,
        auditEvents24h: auditEvents24h.count ?? 0,
      };

      return { orgScopeId: orgId!, areas: deriveAreas(raw) };
    },
  });
  void countExact;
}

function deriveAreas(r: RawCounts): AreaReadiness[] {
  return [
    {
      key: "projects",
      label: "Projects",
      level: r.projects > 0 ? "ready" : "absent",
      primary: r.projects,
      detail:
        r.projects === 0
          ? "No projects in this organization."
          : `${r.projects} project${r.projects === 1 ? "" : "s"} · ${r.environments} environment${r.environments === 1 ? "" : "s"}.`,
    },
    {
      key: "secrets",
      label: "Secrets",
      level:
        r.credentials === 0
          ? "absent"
          : r.credentialsRotating > 0
            ? "partial"
            : r.credentialsActive === r.credentials
              ? "ready"
              : "partial",
      primary: r.credentials,
      detail:
        r.credentials === 0
          ? "No credentials registered."
          : `${r.credentialsActive} active, ${r.credentialsRotating} rotating of ${r.credentials}.`,
    },
    {
      key: "connectors",
      label: "Connectors",
      level:
        r.bindings === 0
          ? "absent"
          : r.bindingsError > 0
            ? "partial"
            : r.bindingsActive === r.bindings
              ? "ready"
              : "partial",
      primary: r.bindings,
      detail:
        r.bindings === 0
          ? "No connector bindings."
          : `${r.bindingsActive} active, ${r.bindingsError} in error of ${r.bindings}.`,
    },
    {
      key: "workflows",
      label: "Workflows",
      level:
        r.workflows === 0
          ? "absent"
          : r.workflowsActive > 0
            ? "ready"
            : "partial",
      primary: r.workflows,
      detail:
        r.workflows === 0
          ? "No workflows defined."
          : `${r.workflowsActive} active of ${r.workflows}.`,
    },
    {
      key: "runs",
      label: "Workflow runs (24h)",
      level:
        r.workflowRunsRecent === 0
          ? "absent"
          : r.workflowRunsFailed > 0
            ? "partial"
            : "ready",
      primary: r.workflowRunsRecent,
      detail:
        r.workflowRunsRecent === 0
          ? "No runs executed in last 24h."
          : `${r.workflowRunsRecent} runs · ${r.workflowRunsFailed} failed.`,
    },
    {
      key: "telemetry",
      label: "Telemetry (24h)",
      level: r.telemetryEvents24h > 0 ? "ready" : "absent",
      primary: r.telemetryEvents24h,
      detail:
        r.telemetryEvents24h > 0
          ? `${r.telemetryEvents24h} events emitted in last 24h.`
          : "No telemetry events in last 24h.",
    },
    {
      key: "audit",
      label: "Audit (24h)",
      level: r.auditEvents24h > 0 ? "ready" : "absent",
      primary: r.auditEvents24h,
      detail:
        r.auditEvents24h > 0
          ? `${r.auditEvents24h} audit events recorded in last 24h.`
          : "No audit events in last 24h.",
    },
  ];
}
