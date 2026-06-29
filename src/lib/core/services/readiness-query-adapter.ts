import { getCoreDbClient } from "@/lib/core/services/db";
import type { OperationsReadinessCounts } from "@/lib/core/services/readiness-operations";

function getCount(result: { count: number | null }): number {
  return result.count ?? 0;
}

export async function fetchCoreReadinessCounts(orgId: string): Promise<OperationsReadinessCounts> {
  const db = getCoreDbClient();
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
    db.from("projects").select("id", { count: "exact", head: true }).eq("organization_id", orgId),

    db
      .from("environments")
      .select("id, projects!inner(organization_id)", { count: "exact", head: true })
      .eq("projects.organization_id", orgId),

    db
      .from("credentials")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", orgId),

    db
      .from("credentials")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", orgId)
      .eq("status", "active"),

    db
      .from("credentials")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", orgId)
      .eq("status", "rotating"),

    db
      .from("connector_bindings")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", orgId),

    db
      .from("connector_bindings")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", orgId)
      .eq("status", "active"),

    db
      .from("connector_bindings")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", orgId)
      .eq("status", "error"),

    db.from("workflows").select("id", { count: "exact", head: true }).eq("organization_id", orgId),

    db
      .from("workflows")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", orgId)
      .eq("status", "active"),

    db
      .from("workflow_runs")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", orgId)
      .gte("created_at", since24h),

    db
      .from("workflow_runs")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", orgId)
      .eq("status", "failed")
      .gte("created_at", since24h),

    db
      .from("telemetry_events")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", orgId)
      .gte("occurred_at", since24h),

    db
      .from("audit_events")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", orgId)
      .gte("created_at", since24h),
  ]);

  const errors = [
    projects.error,
    environmentsViaJoin.error,
    credentialsAll.error,
    credentialsActive.error,
    credentialsRotating.error,
    bindings.error,
    bindingsActive.error,
    bindingsError.error,
    workflows.error,
    workflowsActive.error,
    workflowRunsRecent.error,
    workflowRunsFailed.error,
    telemetryEvents24h.error,
    auditEvents24h.error,
  ].filter(Boolean);

  if (errors.length > 0) throw errors[0];

  return {
    projects: getCount(projects),
    environments: getCount(environmentsViaJoin),
    credentials: getCount(credentialsAll),
    credentialsActive: getCount(credentialsActive),
    credentialsRotating: getCount(credentialsRotating),
    bindings: getCount(bindings),
    bindingsActive: getCount(bindingsActive),
    bindingsError: getCount(bindingsError),
    workflows: getCount(workflows),
    workflowsActive: getCount(workflowsActive),
    workflowRunsRecent: getCount(workflowRunsRecent),
    workflowRunsFailed: getCount(workflowRunsFailed),
    telemetryEvents24h: getCount(telemetryEvents24h),
    auditEvents24h: getCount(auditEvents24h),
  };
}

// TODO(PR-4): If runtime/Glue readiness signals are introduced, isolate those
// behind a separate non-Core adapter and merge at composition time.
