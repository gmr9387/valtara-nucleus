import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon, PageHeader } from "@/components/platform-ui";
export const Route = createFileRoute("/_app/evidence")({ component: () => (<><PageHeader eyebrow="KNOWLEDGE" title="Evidence" /><ComingSoon module="Evidence registry" description="Documents, evidence sets and manifests with hashes, sources and verification." /></>) });
