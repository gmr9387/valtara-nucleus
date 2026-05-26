import { useEffect } from "react";
import { createFileRoute, Outlet, useNavigate, Link, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { AppSidebar } from "@/components/AppSidebar";
import { OrgSwitcher } from "@/components/OrgSwitcher";
import { supabase } from "@/integrations/supabase/client";
import { useMyOrganizations } from "@/lib/queries";
import { useOrgStore } from "@/lib/org-store";
import { logAudit } from "@/lib/audit";
import { LogOut } from "lucide-react";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const { session, loading, user } = useAuth();
  const navigate = useNavigate();
  const orgs = useMyOrganizations();
  const { currentOrgId, setCurrentOrgId } = useOrgStore();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/login", replace: true });
  }, [loading, session, navigate]);

  // Auto-select first org
  useEffect(() => {
    if (orgs.data && orgs.data.length > 0) {
      if (!currentOrgId || !orgs.data.find((o) => o.id === currentOrgId)) {
        setCurrentOrgId(orgs.data[0].id);
      }
    }
  }, [orgs.data, currentOrgId, setCurrentOrgId]);

  if (loading || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-mono-xs text-muted-foreground">LOADING…</div>
      </div>
    );
  }

  const title = pageTitleFromPath(pathname);

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border bg-surface-1/60 px-5 backdrop-blur">
          <div className="flex items-center gap-3 min-w-0">
            <OrgSwitcher />
            <span className="text-border-strong">/</span>
            <span className="truncate text-sm font-medium">{title}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-muted-foreground sm:inline">{user?.email}</span>
            <button
              onClick={async () => {
                await logAudit({ module: "auth", entity_type: "user", action: "sign_out" });
                await supabase.auth.signOut();
                navigate({ to: "/login" });
              }}
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-surface-2 px-2.5 text-xs text-muted-foreground hover:text-foreground"
              title="Sign out"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-auto">
          {orgs.data && orgs.data.length === 0 && pathname !== "/organizations" ? (
            <EmptyOrgPrompt />
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  );
}

function EmptyOrgPrompt() {
  return (
    <div className="flex h-full items-center justify-center p-10">
      <div className="max-w-md rounded-lg border border-border bg-surface-1 p-8 text-center">
        <p className="text-mono-xs text-primary">NO_ORGANIZATION</p>
        <h2 className="mt-3 text-xl font-semibold">Create your first organization</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Every resource in Valtaris Core belongs to an organization.
        </p>
        <Link
          to="/organizations"
          className="mt-5 inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          Go to organizations
        </Link>
      </div>
    </div>
  );
}

function pageTitleFromPath(p: string): string {
  const seg = p.split("/").filter(Boolean)[0] ?? "dashboard";
  const map: Record<string, string> = {
    dashboard: "Overview", organizations: "Organizations", projects: "Projects",
    environments: "Environments", users: "Users", audit: "Audit",
    telemetry: "Telemetry", secrets: "Secrets", connectors: "Connectors",
    workflows: "Workflows", evidence: "Evidence", decisions: "Decisions",
    governance: "Governance",
  };
  return map[seg] ?? seg;
}
