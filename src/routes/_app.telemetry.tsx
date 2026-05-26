import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/platform-ui";
import { PageHeader } from "@/components/platform-ui";
export const Route = createFileRoute("/_app/telemetry")({ component: () => (<><PageHeader eyebrow="OBSERVABILITY" title="Telemetry" /><ComingSoon module="Telemetry" description="Events, metrics and traces for user actions, workflow executions, connector calls and decision activity." /></>) });
