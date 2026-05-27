import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  KeyRound,
  ShieldCheck,
  RefreshCcw,
  LockKeyhole,
  AlertTriangle,
} from "lucide-react";
import { PageHeader, PageBody, EmptyState } from "@/components/platform-ui";
import { useOrgStore } from "@/lib/org-store";

export const Route = createFileRoute("/_app/secrets")({
  component: SecretsPage,
});

const PROVIDERS = [
  {
    name: "OpenAI",
    type: "AI",
    status: "planned",
    rotation: "90d",
    usage: "Decision Engine / Guardian / Claim Clarity",
  },
  {
    name: "Stripe",
    type: "Payments",
    status: "planned",
    rotation: "90d",
    usage: "Cloud billing and subscriptions",
  },
  {
    name: "Twilio",
    type: "Messaging",
    status: "planned",
    rotation: "120d",
    usage: "Notifications and communication workflows",
  },
  {
    name: "Meta",
    type: "Social API",
    status: "planned",
    rotation: "60d",
    usage: "Weaver connector automation",
  },
  {
    name: "Supabase",
    type: "Platform",
    status: "planned",
    rotation: "180d",
    usage: "Internal platform services",
  },
  {
    name: "Custom REST",
    type: "Generic",
    status: "planned",
    rotation: "custom",
    usage: "Weaver and Glue external API integrations",
  },
];

function SecretsPage() {
  const { currentOrgId } = useOrgStore();

  const stats = useMemo(() => {
    return {
      providers: PROVIDERS.length,
      active: PROVIDERS.filter((p) => p.status === "active").length,
      planned: PROVIDERS.filter((p) => p.status === "planned").length,
    };
  }, []);

  return (
    <>
      <PageHeader
        eyebrow="INFRASTRUCTURE"
        title="Secrets"
        description="Tenant-scoped credential vault for API keys, tokens, rotations, and secure connector access."
      />

      <PageBody>
        {!currentOrgId ? (
          <EmptyState
            title="Select an organization"
            description="Secrets are scoped to an organization and never exposed directly to the browser."
            icon={<LockKeyhole className="h-5 w-5" />}
          />
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <Metric
                label="Providers"
                value={String(stats.providers)}
                icon={<KeyRound className="h-4 w-4" />}
              />
              <Metric
                label="Active Secrets"
                value={String(stats.active)}
                icon={<ShieldCheck className="h-4 w-4" />}
                tone="good"
              />
              <Metric
                label="Planned"
                value={String(stats.planned)}
                icon={<RefreshCcw className="h-4 w-4" />}
                tone="warn"
              />
            </div>

            <div className="rounded-xl border border-border bg-surface-1">
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <div>
                  <h2 className="text-sm font-semibold">Credential Providers</h2>
                  <p className="text-xs text-muted-foreground">
                    Providers that Valtaris Core will manage through encrypted server-side storage.
                  </p>
                </div>

                <span className="rounded border border-status-pending/30 bg-status-pending/10 px-2 py-1 text-mono-xs text-status-pending">
                  Phase 2
                </span>
              </div>

              <div className="divide-y divide-border">
                {PROVIDERS.map((provider) => (
                  <div
                    key={provider.name}
                    className="grid grid-cols-[160px_120px_100px_100px_1fr] gap-3 px-5 py-3 text-sm"
                  >
                    <div>
                      <div className="font-medium text-foreground">{provider.name}</div>
                      <div className="text-xs text-muted-foreground">{provider.type}</div>
                    </div>

                    <div>
                      <span className="rounded border border-border bg-surface-2 px-2 py-0.5 text-mono-xs text-muted-foreground">
                        {provider.status}
                      </span>
                    </div>

                    <div className="font-mono text-xs text-muted-foreground">
                      {provider.rotation}
                    </div>

                    <div className="font-mono text-xs text-muted-foreground">
                      encrypted
                    </div>

                    <div className="text-xs text-muted-foreground">
                      {provider.usage}
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
                    This page should not collect raw secrets yet. The next Core phase should add
                    Supabase Edge Functions for encrypted write/read operations so API keys never
                    touch normal client-side state.
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