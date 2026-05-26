import type { ReactNode } from "react";

export function PageHeader({
  eyebrow, title, description, actions,
}: { eyebrow?: string; title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border bg-surface-1/30 px-6 py-5">
      <div className="min-w-0">
        {eyebrow && <p className="text-mono-xs text-muted-foreground">{eyebrow}</p>}
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

export function PageBody({ children }: { children: ReactNode }) {
  return <div className="p-6">{children}</div>;
}

export function EmptyState({
  title, description, action,
}: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-surface-1/40 p-12 text-center">
      <p className="text-sm font-medium">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function StatusDot({ status }: { status: string }) {
  const map: Record<string, string> = {
    active: "bg-success", paused: "bg-warning", suspended: "bg-warning",
    archived: "bg-muted-foreground", development: "bg-chart-4",
    staging: "bg-warning", production: "bg-success",
  };
  return <span className={"inline-block h-1.5 w-1.5 rounded-full " + (map[status] ?? "bg-muted-foreground")} />;
}

export function ComingSoon({ module, description }: { module: string; description: string }) {
  return (
    <div className="p-6">
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-surface-1/40 px-6 py-20 text-center">
        <p className="text-mono-xs text-primary">PHASE_2 · ROADMAP</p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight">{module}</h2>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
        <div className="mt-6 grid w-full max-w-lg grid-cols-3 gap-px overflow-hidden rounded-md border border-border bg-border">
          {["Schema", "Service", "UI"].map((s) => (
            <div key={s} className="bg-surface-1 p-3 text-left">
              <div className="text-mono-xs text-muted-foreground">{s.toUpperCase()}</div>
              <div className="mt-1 text-xs">Planned</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
