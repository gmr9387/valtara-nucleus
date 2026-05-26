import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon, PageHeader } from "@/components/platform-ui";
export const Route = createFileRoute("/_app/connectors")({ component: () => (<><PageHeader eyebrow="INFRASTRUCTURE" title="Connectors" /><ComingSoon module="Connector registry" description="Versioned connectors with capabilities, policies and credentials per organization." /></>) });
