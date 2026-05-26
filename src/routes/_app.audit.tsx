import { createFileRoute } from "@tanstack/react-router";
import { useAuditEvents } from "@/lib/queries";
import { useOrgStore } from "@/lib/org-store";
import { PageHeader, PageBody, EmptyState } from "@/components/platform-ui";
import { Th, Td } from "./_app.organizations";

export const Route = createFileRoute("/_app/audit")({ component: AuditPage });

function AuditPage() {
  const { currentOrgId } = useOrgStore();
  const audit = useAuditEvents(currentOrgId);

  return (
    <>
      <PageHeader
        eyebrow="AUDIT"
        title="Audit log"
        description="Append-only record of every platform action in this organization."
      />
      <PageBody>
        {audit.data?.length ? (
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-surface-1 text-mono-xs text-muted-foreground">
                <tr><Th>Time</Th><Th>Module</Th><Th>Action</Th><Th>Entity</Th><Th>Actor</Th></tr>
              </thead>
              <tbody className="divide-y divide-border bg-surface-1/40">
                {audit.data.map((e) => (
                  <tr key={e.id} className="hover:bg-surface-2/60">
                    <Td><span className="font-mono text-xs text-muted-foreground">{new Date(e.created_at).toLocaleString()}</span></Td>
                    <Td><span className="text-mono-xs text-primary">{e.module.toUpperCase()}</span></Td>
                    <Td>{e.action}</Td>
                    <Td><span className="font-mono text-xs">{e.entity_type}{e.entity_id ? ` · ${e.entity_id.slice(0, 8)}` : ""}</span></Td>
                    <Td><span className="font-mono text-xs text-muted-foreground">{e.user_id?.slice(0, 8) ?? "—"}</span></Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="No audit events yet" description="Actions you perform will appear here." />
        )}
      </PageBody>
    </>
  );
}
