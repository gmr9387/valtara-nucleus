import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  Workflow,
  GitBranch,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Clock3,
  ListChecks,
} from "lucide-react";
import { PageHeader, PageBody, EmptyState } from "@/components/platform-ui";
import { useOrgStore } from "@/lib/org-store";

export const Route = createFileRoute("/_app/workflows")({
  component: WorkflowsPage,
});

const WORKFLOW_BLUEPRINTS = [
  {
    name: "Claim Appeal Packet",
    ownerModule: "Claim Clarity",
    status: "planned",
    version: "draft",
    steps: 7,
    checkpoints: 3,
    approvals: 1,
    retries: true,
    description: "Build evidence packet, validate requirements, draft appeal, route for approval.",
  },
  {
    name: "Connector Sync",
    ownerModule: "Weaver",
    status: "planned",
    version: "draft",
    steps: 5,
    checkpoints: 2,
    approvals: 0,
    retries: true,
    description: "Pull data from external connector, normalize payload, store results, emit telemetry.",
  },
  {
    name: "Risk Review",
    ownerModule: "Guardian",
    status: "planned",
    version: "draft",
    steps: 6,
    checkpoints: 4,
    approvals: 2,
    retries: false,
    description: "Evaluate risk policy, produce decision trace, require approval for high-risk actions.",
  },
  {
    name: "Secret Rotation",
    ownerModule: "Core",
    status: "planned",
    version: "draft",
    steps: 4,
    checkpoints: 2,
    approvals: 1,
    retries: true,
    description: "Rotate credential, validate connector health, audit rotation, notify owner.",
  },
];

function WorkflowsPage() {
  const { currentOrgId } = useOrgStore();

  const stats = useMemo(() => {
    return {
      total: WORKFLOW_BLUEPRINTS.length,
      approvals: WORKFLOW_BLUEPRINTS.reduce((sum, w) => sum + w.approvals, 0),
      checkpoints: WORKFLOW_BLUEPRINTS.reduce((sum, w) => sum + w.checkpoints, 0),
      retryEnabled: WORKFLOW_BLUEPRINTS.filter((w) => w.retries).length,
    };
  }, []);

  return (
    <>
      <PageHeader
        eyebrow="INFRASTRUCTURE"
        title="Workflows"
        description="Workflow registry for definitions, versions, runs, steps, checkpoints, approvals, retries, and replay."
      />

      <PageBody>
        {!currentOrgId ? (
          <EmptyState
            title="Select an organization"
            description="Workflow definitions are tenant-scoped and later bound to projects and environments."
            icon={<Workflow className="h-5 w-5" />}
          />
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
              <Metric label="Blueprints" value={String(stats.total)} icon={<Workflow className="h-4 w-4" />} />
              <Metric label="Checkpoints" value={String(stats.checkpoints)} icon={<ListChecks className="h-4 w-4" />} tone="good" />
              <Metric label="Approvals" value={String(stats.approvals)} icon={<CheckCircle2 className="h-4 w-4" />} tone="warn" />
              <Metric label="Retry Enabled" value={String(stats.retryEnabled)} icon={<RotateCcw className="h-4 w-4" />} />
            </div>

            <div className="rounded-xl border border-border bg-surface-1">
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <div>
                  <h2 className="text-sm font-semibold">Workflow Registry</h2>
                  <p className="text-xs text-muted-foreground">
                    Shared runtime definitions that Glue will execute and products will consume.
                  </p>
                </div>

                <span className="rounded border border-status-pending/30 bg-status-pending/10 px-2 py-1 text-mono-xs text-status-pending">
                  Phase 3
                </span>
              </div>

              <div className="divide-y divide-border">
                {WORKFLOW_BLUEPRINTS.map((workflow) => (
                  <div
                    key={workflow.name}
                    className="grid grid-cols-[220px_130px_90px_1fr_180px] gap-3 px-5 py-3 text-sm"
                  >
                    <div>
                      <div className="font-medium text-foreground">{workflow.name}</div>
                      <div className="text-xs text-muted-foreground">{workflow.ownerModule}</div>
                    </div>

                    <div>
                      <span className="rounded border border-border bg-surface-2 px-2 py-0.5 text-mono-xs text-muted-foreground">
                        {workflow.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <GitBranch className="h-3 w-3" />
                      {workflow.version}
                    </div>

                    <div className="text-xs text-muted-foreground">{workflow.description}</div>

                    <div className="grid grid-cols-3 gap-2 text-center text-[11px] text-muted-foreground">
                      <MiniStat label="Steps" value={workflow.steps} />
                      <MiniStat label="CP" value={workflow.checkpoints} />
                      <MiniStat label="Appr." value={workflow.approvals} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-status-pending/30 bg-status-pending/5 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-4 w-4 text-status-pending" />
                <div>
                  <h3 className="text-sm font-semibold">Principal constraint</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    This page should stay registry-only until the workflow database tables exist.
                    Actual execution belongs to Glue runtime workers with checkpoints, retries,
                    approvals, and replay—not direct browser execution.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </PageBody>
    </>
  );
}

function Metric({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  tone?: "good" | "warn";
}) {
  const cls =
    tone === "good"
      ? "border-status-paid/20 bg-status-paid/5"
      : tone === "warn"
        ? "border-status-pending/20 bg-status-pending/5"
        : "border-primary/20 bg-primary/5";

  return (
    <div className={`rounded-xl border p-4 ${cls}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <div className="text-muted-foreground">{icon}</div>
      </div>
      <div className="mt-2 text-2xl font-semibold tracking-tight">{value}</div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded border border-border bg-surface-2 px-2 py-1">
      <div className="font-mono text-xs text-foreground">{value}</div>
      <div className="text-[10px] uppercase tracking-wider">{label}</div>
    </div>
  );
}