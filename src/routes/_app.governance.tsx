import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon, PageHeader } from "@/components/platform-ui";
export const Route = createFileRoute("/_app/governance")({ component: () => (<><PageHeader eyebrow="GOVERN" title="Governance" /><ComingSoon module="Governance" description="Policies, versions, approval workflows, execution controls and tenant restrictions." /></>) });
