/**
 * ValtariOS Glue — Stable API Route: POST /api/v0/workflows/execute
 *
 * TanStack Start server route that exposes the Glue workflow execution
 * endpoint at a stable, content-addressed-free URL.
 *
 * Core calls this endpoint after a requires_approval decision to trigger
 * a Glue workflow run.
 *
 * Auth: X-Glue-Api-Key header matched against GLUE_API_KEY env var.
 */

import { createFileRoute } from "@tanstack/react-router";
import { handleExecuteRequest } from "@/lib/glue/api/execute-handler";

export const Route = createFileRoute("/api/v0/workflows/execute")({
  server: {
    handlers: {
      POST: ({ request }) => handleExecuteRequest(request),
    },
  },
});
