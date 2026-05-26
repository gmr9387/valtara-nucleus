import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon, PageHeader } from "@/components/platform-ui";
export const Route = createFileRoute("/_app/decisions")({ component: () => (<><PageHeader eyebrow="KNOWLEDGE" title="Decisions" /><ComingSoon module="Decision registry" description="Explainable recommendations: inputs, outputs, reasoning, confidence and traces." /></>) });
