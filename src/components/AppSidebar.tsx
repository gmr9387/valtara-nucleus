import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, Building2, FolderKanban, Server, Users, ScrollText,
  Activity, KeyRound, PlugZap, Workflow, FileStack, GitBranch, ShieldCheck,
} from "lucide-react";

type Item = { to: string; label: string; icon: React.ComponentType<{ className?: string }>; soon?: boolean };

const groups: { label: string; items: Item[] }[] = [
  {
    label: "PLATFORM",
    items: [
      { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
      { to: "/organizations", label: "Organizations", icon: Building2 },
      { to: "/projects", label: "Projects", icon: FolderKanban },
      { to: "/environments", label: "Environments", icon: Server },
      { to: "/users", label: "Users & Roles", icon: Users },
      { to: "/audit", label: "Audit", icon: ScrollText },
    ],
  },
  {
    label: "OBSERVABILITY",
    items: [
      { to: "/telemetry", label: "Telemetry", icon: Activity, soon: true },
    ],
  },
  {
    label: "INFRASTRUCTURE",
    items: [
      { to: "/secrets", label: "Secrets", icon: KeyRound, soon: true },
      { to: "/connectors", label: "Connectors", icon: PlugZap, soon: true },
      { to: "/workflows", label: "Workflows", icon: Workflow, soon: true },
    ],
  },
  {
    label: "KNOWLEDGE",
    items: [
      { to: "/evidence", label: "Evidence", icon: FileStack, soon: true },
      { to: "/decisions", label: "Decisions", icon: GitBranch, soon: true },
    ],
  },
  {
    label: "GOVERN",
    items: [
      { to: "/governance", label: "Governance", icon: ShieldCheck, soon: true },
    ],
  },
];

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <aside className="hidden w-60 shrink-0 border-r border-sidebar-border bg-sidebar md:flex md:flex-col">
      <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-4">
        <div className="h-6 w-6 rounded-sm bg-primary" />
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold tracking-tight">Valtaris Core</span>
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Platform</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {groups.map((g) => (
          <div key={g.label} className="mb-4">
            <div className="px-2 pb-1.5 text-[10px] font-medium tracking-widest text-muted-foreground">
              {g.label}
            </div>
            <ul className="space-y-0.5">
              {g.items.map((it) => {
                const active = pathname === it.to || pathname.startsWith(it.to + "/");
                return (
                  <li key={it.to}>
                    <Link
                      to={it.to}
                      className={
                        "group flex h-8 items-center justify-between rounded-md px-2 text-[13px] " +
                        (active
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground")
                      }
                    >
                      <span className="flex items-center gap-2 min-w-0">
                        <it.icon className={"h-3.5 w-3.5 " + (active ? "text-primary" : "")} />
                        <span className="truncate">{it.label}</span>
                      </span>
                      {it.soon && (
                        <span className="text-[9px] tracking-widest text-muted-foreground/70 group-hover:text-muted-foreground">
                          SOON
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <div className="text-mono-xs text-muted-foreground">v0.1 · phase 1</div>
      </div>
    </aside>
  );
}
