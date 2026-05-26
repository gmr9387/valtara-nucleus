import { createFileRoute } from "@tanstack/react-router";
import { useOrgMembers, useMyOrganizations } from "@/lib/queries";
import { useOrgStore } from "@/lib/org-store";
import { PageHeader, PageBody, EmptyState } from "@/components/platform-ui";
import { Th, Td } from "./_app.organizations";

export const Route = createFileRoute("/_app/users")({ component: UsersPage });

function UsersPage() {
  const { currentOrgId } = useOrgStore();
  const orgs = useMyOrganizations();
  const members = useOrgMembers(currentOrgId);
  const current = orgs.data?.find((o) => o.id === currentOrgId);

  return (
    <>
      <PageHeader
        eyebrow="IDENTITY"
        title="Users & Roles"
        description={current ? `Members of ${current.name}.` : "Select an organization."}
      />
      <PageBody>
        {members.data?.length ? (
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-surface-1 text-mono-xs text-muted-foreground">
                <tr><Th>User ID</Th><Th>Role</Th><Th>Joined</Th></tr>
              </thead>
              <tbody className="divide-y divide-border bg-surface-1/40">
                {members.data.map((m) => (
                  <tr key={m.id}>
                    <Td><span className="font-mono text-xs text-muted-foreground">{m.user_id}</span></Td>
                    <Td>
                      <span className="inline-flex items-center rounded-md border border-border bg-surface-2 px-2 py-0.5 text-mono-xs text-primary">
                        {m.role.toUpperCase()}
                      </span>
                    </Td>
                    <Td><span className="text-muted-foreground">{new Date(m.created_at).toLocaleDateString()}</span></Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="No members visible" description="Member invitations land in Phase 2." />
        )}
      </PageBody>
    </>
  );
}
