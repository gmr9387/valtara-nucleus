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
  summary: {
    ready: number;
    partial: number;
    absent: number;
    unknown: number;
    total: number;
    readinessScore: number;
  };
}

export interface OperationsReadinessCounts {
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

export function summarizeReadinessAreas(areas: AreaReadiness[]) {
  const summary = {
    ready: 0,
    partial: 0,
    absent: 0,
    unknown: 0,
    total: areas.length,
    readinessScore: 0,
  };

  for (const area of areas) {
    summary[area.level]++;
  }

  const score =
    areas.length > 0
      ? Math.round(
          (summary.ready * 100 + summary.partial * 50 + summary.unknown * 25) / areas.length,
        )
      : 0;

  summary.readinessScore = score;

  return summary;
}

export function deriveReadinessAreas(r: OperationsReadinessCounts): AreaReadiness[] {
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
      level: r.workflows === 0 ? "absent" : r.workflowsActive > 0 ? "ready" : "partial",
      primary: r.workflows,
      detail:
        r.workflows === 0
          ? "No workflows defined."
          : `${r.workflowsActive} active of ${r.workflows}.`,
    },
    {
      key: "runs",
      label: "Workflow runs (24h)",
      level: r.workflowRunsRecent === 0 ? "absent" : r.workflowRunsFailed > 0 ? "partial" : "ready",
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

export function buildOperationsReadiness(args: {
  orgId: string;
  counts: OperationsReadinessCounts;
}): OperationsReadiness {
  const areas = deriveReadinessAreas(args.counts);

  return {
    orgScopeId: args.orgId,
    areas,
    summary: summarizeReadinessAreas(areas),
  };
}
