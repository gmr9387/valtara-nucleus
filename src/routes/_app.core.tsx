import { createFileRoute } from "@tanstack/react-router";
import { PageBody, PageHeader } from "@/components/platform-ui";
import { CORE_MODULE_REGISTRY } from "@/lib/core";

export const Route = createFileRoute("/_app/core")({
  head: () => ({
    meta: [
      { title: "Core — ValtariOS" },
      {
        name: "description",
        content:
          "ValtariOS Core module registry — the shared decision engine for the platform.",
      },
    ],
  }),
  component: CorePage,
});

function CorePage() {
  return (
    <>
      <PageHeader
        eyebrow="VALTARIOS // CORE"
        title="Core Module Registry"
        description="Permanent home for the ValtariOS shared decision engine. Architecture boundaries only — no behavior extracted yet."
      />
      <PageBody>
        <div className="rounded-xl border border-border bg-surface-1">
          <div className="grid grid-cols-[160px_1fr_180px] gap-3 border-b border-border px-5 py-2 text-mono-xs text-muted-foreground">
            <div>MODULE</div>
            <div>PURPOSE</div>
            <div className="text-right">STATUS</div>
          </div>
          <div className="divide-y divide-border">
            {CORE_MODULE_REGISTRY.map((m) => (
              <div
                key={m.name}
                className="grid grid-cols-[160px_1fr_180px] items-start gap-3 px-5 py-4 text-sm"
              >
                <div className="font-mono text-xs uppercase tracking-wider text-foreground">
                  {m.name}
                </div>
                <div className="text-sm text-muted-foreground">{m.purpose}</div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-primary">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    {m.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </PageBody>
    </>
  );
}
