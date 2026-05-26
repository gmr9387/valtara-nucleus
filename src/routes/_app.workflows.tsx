import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon, PageHeader } from "@/components/platform-ui";
export const Route = createFileRoute("/_app/workflows")({ component: () => (<><PageHeader eyebrow="INFRASTRUCTURE" title="Workflows" /><ComingSoon module="Workflow registry" description="Definitions, versions, runs, steps, checkpoints, approvals and retries." /></>) });
