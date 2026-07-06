/**
 * ValtariOS Core — Stable API Route: POST /api/v0/evaluate
 *
 * TanStack Start server route that exposes Core's evaluation endpoint
 * at a stable, content-addressed-free URL.
 *
 * Unlike server functions (/_server/<hash>), this route has a fixed path
 * that DualPay and other service callers can target without TanStack Start
 * client machinery.
 *
 * Auth: X-Core-Api-Key header matched against CORE_API_KEY env var.
 */

import { createFileRoute } from "@tanstack/react-router";
import { handleEvaluateRequest } from "@/lib/core/api/evaluate-handler";

export const Route = createFileRoute("/api/v0/evaluate")({
  server: {
    handlers: {
      POST: ({ request }) => handleEvaluateRequest(request),
    },
  },
});
