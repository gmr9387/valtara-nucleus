import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  PlugZap,
  ShieldCheck,
  GitBranch,
  KeyRound,
  Webhook,
  AlertTriangle,
} from "lucide-react";
import { PageHeader, PageBody, EmptyState } from "@/components/platform-ui";
import { useOrgStore } from "@/lib/org-store";

export const Route = createFileRoute("/_app/connectors")({
  component: ConnectorsPage,
});

const CONNECTORS = [
  {
    name: "OpenAI",
    category: "AI",
    version: "v1",
    status: "planned",
    capabilities: ["chat", "embeddings", "summaries", "classification"],
    requiresSecret: true,
    ownerModule: "Decisions / Guardian",
  },
  {
    name: "Stripe",
    category: "Payments",
    version: "v1",
    status: "planned",
    capabilities: ["customers", "subscriptions", "invoices", "webhooks"],
    requiresSecret: true,
    ownerModule: "Cloud Billing",
  },
  {
    name: "Supabase",
    category: "Database",
    version: "v1",
    status: "planned",
    capabilities: ["tables", "storage", "edge-functions", "auth"],
    requiresSecret: true,
    ownerModule: "Core Platform",
  },
  {
    name: "Twilio",
    category: "Messaging",
    version: "v1",
    status: "planned",
    capabilities: ["sms", "voice", "notifications"],
    requiresSecret: true,
    ownerModule: "Glue / Notifications",
  },
  {
    name: "Meta",
    category: "Social",
    version: "v1",
    status: "planned",
    capabilities: ["pages", "posts", "comments", "insights"],
    requiresSecret: true,
    ownerModule: "Weaver",
  },
  {
    name: "Generic REST",
    category: "Universal",
    version: "v1",
    status: "planned",
    capabilities: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    requiresSecret: false,
    ownerModule: "Weaver / Glue",
  },
  {
    name: "Generic Webhook",
    category: "Universal",
    version: "v1",
    status: "planned",
    capabilities: ["incoming", "outgoing", "signature-verification"],
    requiresSecret: false,
    ownerModule: "Glue Runtime",
  },
];

function ConnectorsPage() {
  const { currentOrgId } = useOrgStore();

  const stats = useMemo(() => {
    const secretBacked = CONNECTORS.filter((connector) => connector.requiresSecret).length;

    return {
      total: CONNECTORS.length,
      secretBacked,
      universal: CONNECTORS.filter((connector) => connector.category === "Universal").length,
    };
  }, []);

  return (
    <>
      <PageHeader
        eyebrow="INFRASTRUCTURE"
        title="Connectors"
        description="Versioned connector registry for APIs, webhooks, credentials, capabilities, and organization-level policies."
      />

      <PageBody>
        {!currentOrgId ? (
          <EmptyState
            title="Select an organization"
            description="Connectors are scoped per organization and later bound to projects and environments."
            icon={<PlugZap className="h-5 w-5" />}
          />
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <Metric
                label="Connectors"
                value={String(stats.total)}
                icon={<PlugZap className="h-4 w-4" />}
              />
              <Metric
                label="Credential-backed"
                value={String(stats.secretBacked)}
                icon={<KeyRound className="h-4 w-4" />}
                tone="warn"
              />
              <Metric
                label="Universal"
                value={String(stats.universal)}
                icon={<Webhook className="h-4 w-4" />}
                tone="good"
              />
            </div>

            <div className="rounded-xl border border-border bg-surface-1">
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <div>
                  <h2 className="text-sm font-semibold">Connector Registry</h2>
                  <p className="text-xs text-muted-foreground">
                    The shared integration catalog that Weaver and Glue will consume.
                  </p>
                </div>

                <span className="rounded border border-status-pending/30 bg-status-pending/10 px-2 py-1 text-mono-xs text-status-pending">
                  Phase 2
                </span>
              </div>

              <div className="divide-y divide-border">
                {CONNECTORS.map((connector) => (
                  <div
                    key={connector.name}
                    className="grid grid-cols-[170px_110px_90px_1fr_150px] gap-3 px-5 py-3 text-sm"
                  >
                    <div>
                      <div className="font-medium text-foreground">{connector.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {connector.ownerModule}
                      </div>
                    </div>

                    <div>
                      <span className="rounded border border-border bg-surface-2 px-2 py-0.5 text-mono-xs text-muted-foreground">
                        {connector.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <GitBranch className="h-3 w-3" />
                      {connector.version}
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {connector.capabilities.map((capability) => (
                        <span
                          key={capability}
                          className="rounded border border-primary/15 bg-primary/5 px-1.5 py-0.5 text-[10px] text-primary"
                        >
                          {capability}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {connector.requiresSecret ? (
                        <>
                          <KeyRound className="h-3.5 w-3.5 text-status-pending" />
                          Secret required
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="h-3.5 w-3.5 text-status-paid" />
                          Policy only
                        </>
                      )}
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
                    This page should remain a registry surface until the Secrets module has
                    encrypted server-side credential storage. Connector execution should later
                    happen through Edge Functions or Glue workers, never directly from the browser.
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