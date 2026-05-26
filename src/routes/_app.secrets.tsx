import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon, PageHeader } from "@/components/platform-ui";
export const Route = createFileRoute("/_app/secrets")({ component: () => (<><PageHeader eyebrow="INFRASTRUCTURE" title="Secrets" /><ComingSoon module="Credential vault" description="Encrypted, server-side credential storage for OpenAI, Stripe, Twilio, Meta, Supabase and custom providers." /></>) });
