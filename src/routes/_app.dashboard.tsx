import { createFileRoute } from "@tanstack/react-router";
import { useMyOrganizations, useProjects, useEnvironments, useAuditEvents } from "@/lib/queries";
import { useOrgStore } from "@/lib/org-store";
import { PageHeader, PageBody } from "@/components/platform-ui";
import { Building2, FolderKanban, Server, ScrollText } from "lucide-react";

export const Route = createFileRoute("/_app/dashboard")({ component: Dashboard });

function Dashboard() {
  const { currentOrgId } = useOrgStore();
  const orgs = useMyOrganizations();
  const projects = useProjects(currentOrgId);
  const envs = useEnvironments(currentOrgId);
  const audit = useAuditEvents(currentOrgId);
  const currentOrg = orgs.data?.find((o) => o.id === currentOrgId);

  const stats = [
    { label: "Organizations", value: orgs.data?.length ?? 0, icon: Building2 },
    { label: "Projects", value: projects.data?.length ?? 0, icon: FolderKanban },
    { label: "Environments", value: envs.data?.length ?? 0, icon: Server },
    { label: "Audit events (200 max)", value: audit.data?.length ?? 0, icon: ScrollText },
  ];

  return (
    <>
      <PageHeader
        eyebrow="OVERVIEW"
        title={currentOrg?.name ?? "Platform"}
        description="Live state of the Valtaris Core platform layer."
      />
      <PageBody>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-lg border border-border bg-surface-1 p-4">
              <div className="flex items-center justify-between">
                <span className="text-mono-xs text-muted-foreground">{s.label.toUpperCase()}</span>
                <s.icon className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <div className="mt-2 text-2xl font-semibold tracking-tight tabular-nums">{s.value}</div>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-lg border border-border bg-surface-1">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h2 className="text-sm font-semibold">Recent activity</h2>
            <span className="text-mono-xs text-muted-foreground">{audit.data?.length ?? 0} EVENTS</span>
          </div>
          <div className="divide-y divide-border">
            {(audit.data ?? []).slice(0, 8).map((e) => (
              <div key={e.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-mono-xs text-primary">{e.module.toUpperCase()}</span>
                  <span className="truncate">{e.action} <span className="text-muted-foreground">{e.entity_type}</span></span>
                </div>
                <span className="text-mono-xs text-muted-foreground">{new Date(e.created_at).toLocaleTimeString()}</span>
              </div>
            ))}
            {(!audit.data || audit.data.length === 0) && (
              <div className="px-4 py-10 text-center text-sm text-muted-foreground">No activity yet.</div>
            )}
          </div>
        </div>
      </PageBody>
    </>
  );
}
