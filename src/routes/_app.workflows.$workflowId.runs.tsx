import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { PageHeader, PageBody, EmptyState, StatusPill } from "@/components/platform-ui";
import { LoadingState } from "@/components/system/LoadingState";
import { ErrorState } from "@/components/system/ErrorState";
import { useWorkflow, useWorkflowRuns } from "@/lib/workflows/queries";

export const Route = createFileRoute("/_app/workflows/$workflowId/runs")({
  component: WorkflowRunsPage,
});

function WorkflowRunsPage() {
  const { workflowId } = Route.useParams();
  const workflow = useWorkflow(workflowId);
  const runs = useWorkflowRuns(workflowId);

  return (
    <>
      <PageHeader
        eyebrow="WORKFLOW RUNS"
        title={workflow.data?.name ?? "Runs"}
        description="Recent executions for this workflow."
        actions={
          <Link
            to="/workflows/$workflowId"
            params={{ workflowId }}
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-surface-2 px-3 text-xs"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Workflow
          </Link>
        }
      />

      <PageBody>
        {runs.isLoading ? (
          <LoadingState />
        ) : runs.error ? (
          <ErrorState error={runs.error} onRetry={() => void runs.refetch()} />
        ) : (runs.data ?? []).length === 0 ? (
          <EmptyState title="No runs yet" description="Start a run from the workflow page." />
        ) : (
          <div className="rounded-xl border border-border bg-surface-1">
            <div className="grid grid-cols-[1fr_120px_180px_180px_120px] gap-3 border-b border-border px-5 py-2 text-mono-xs text-muted-foreground">
              <div>RUN ID</div>
              <div>STATUS</div>
              <div>STARTED</div>
              <div>COMPLETED</div>
              <div className="text-right">ACTION</div>
            </div>
            <div className="divide-y divide-border">
              {(runs.data ?? []).map((r) => (
                <div
                  key={r.id}
                  className="grid grid-cols-[1fr_120px_180px_180px_120px] items-center gap-3 px-5 py-3 text-sm"
                >
                  <div className="truncate font-mono text-xs">{r.id}</div>
                  <div>
                    <StatusPill status={r.status} />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {r.started_at ? new Date(r.started_at).toLocaleString() : "—"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {r.completed_at ? new Date(r.completed_at).toLocaleString() : "—"}
                  </div>
                  <div className="text-right">
                    <Link
                      to="/workflows/runs/$runId"
                      params={{ runId: r.id }}
                      className="inline-flex h-7 items-center rounded-md border border-border bg-surface-2 px-2 text-xs"
                    >
                      Open
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </PageBody>
    </>
  );
}
