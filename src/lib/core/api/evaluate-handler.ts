/**
 * ValtariOS Core — Stable Evaluate API Handler
 *
 * Pure HTTP handler for POST /api/v0/evaluate.
 * Accepts CoreEvaluationRequest, validates X-Core-Api-Key, runs the
 * evaluation pipeline, and returns CoreEvaluationResponse as JSON.
 *
 * Separated from the route file so the handler can be unit-tested
 * without a running HTTP server and without TanStack Start machinery.
 *
 * DualPay integration:
 *   POST /api/v0/evaluate
 *   Content-Type: application/json
 *   X-Core-Api-Key: <CORE_API_KEY>
 *   Body: { organizationId, subjectId, mode, facts, correlationId? }
 */

import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { runEvaluation, type CoreEvaluationIO } from "@/lib/core/engine";
import { validateCoreApiKey, CORE_API_KEY_HEADER, CORE_CALLER_SERVICE } from "@/lib/core/m2m-auth";
import { callGlueExecute } from "@/lib/core/glue-dispatch";

// ── Input schema ─────────────────────────────────────────────────────────────

const evaluationRequestSchema = z.object({
  organizationId: z.string().min(1),
  subjectId: z.string().min(1),
  mode: z.enum(["instant", "deep", "assisted", "live", "replay", "shadow", "dry_run"]),
  facts: z.record(z.unknown()),
  rulesetVersion: z.string().optional(),
  correlationId: z.string().optional(),
});

// ── Supabase admin client (service-role, bypasses RLS) ────────────────────────

function makeAdminClient() {
  const url =
    (import.meta.env?.VITE_SUPABASE_URL as string | undefined) ?? process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing Supabase service-role config (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).",
    );
  }

  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// ── IO implementation ─────────────────────────────────────────────────────────

function buildIO(adminClient: ReturnType<typeof makeAdminClient>): CoreEvaluationIO {
  return {
    async writeAudit({
      traceId,
      outcome,
      callerIdentity,
      organizationId,
      correlationId,
      confidenceScore,
      dispatch,
    }) {
      try {
        await adminClient.from("audit_events").insert({
          organization_id: organizationId ?? null,
          user_id: null,
          module: "core",
          entity_type: "evaluation",
          entity_id: traceId,
          action: "evaluate" as const,
          correlation_id: correlationId ?? null,
          ip_address: null,
          after_json: {
            outcome,
            confidence_score: confidenceScore,
            caller_identity: callerIdentity,
            trace_id: traceId,
            dispatch_status: dispatch?.status ?? null,
            dispatch_run_id: dispatch?.runId ?? null,
          } as never,
        });
      } catch (err) {
        console.warn("[core:api:evaluate] audit write failed", err);
      }
    },

    async writeTelemetry({ traceId, module, durationMs, outcome, organizationId, dispatch }) {
      try {
        await adminClient.from("telemetry_events").insert({
          organization_id: organizationId ?? null,
          user_id: null,
          module,
          event_type: "core.evaluation.complete",
          severity: "info" as const,
          trace_id: traceId,
          span_id: null,
          correlation_id: null,
          message: `Evaluation complete: outcome=${outcome} duration=${durationMs}ms`,
          attributes_json: {
            outcome,
            duration_ms: durationMs,
            trace_id: traceId,
            dispatch_status: dispatch?.status ?? null,
            dispatch_run_id: dispatch?.runId ?? null,
          } as never,
        });
      } catch (err) {
        console.warn("[core:api:evaluate] telemetry write failed", err);
      }
    },

    async dispatchGlueWorkflow({ organizationId, subjectId, correlationId, payload }) {
      const executeUrl = process.env.GLUE_EXECUTE_URL;
      const apiKey = process.env.GLUE_API_KEY;
      const workflowKey = process.env.GLUE_WORKFLOW_KEY;
      const workflowVersionId = process.env.GLUE_WORKFLOW_VERSION_ID;
      const workflowVersionRaw = process.env.GLUE_WORKFLOW_VERSION;

      // If the required env vars are not configured, skip dispatch silently.
      if (!executeUrl || !apiKey || !workflowKey) {
        return { status: "skipped" as const, error: "Glue dispatch not configured" };
      }

      const workflowVersion =
        !workflowVersionId && workflowVersionRaw ? parseInt(workflowVersionRaw, 10) : undefined;

      return callGlueExecute({
        executeUrl,
        apiKey,
        workflowKey,
        workflowVersionId: workflowVersionId || undefined,
        workflowVersion,
        organizationId,
        subjectId,
        correlationId,
        payload,
      });
    },
  };
}

// ── Handler ───────────────────────────────────────────────────────────────────

/**
 * Handle a POST /api/v0/evaluate request.
 *
 * @param request  - The incoming HTTP Request object.
 * @param ioOverride - Optional IO override for tests (bypasses Supabase).
 */
export async function handleEvaluateRequest(
  request: Request,
  ioOverride?: CoreEvaluationIO,
): Promise<Response> {
  // ── 1. Auth: require X-Core-Api-Key ──────────────────────────────────────
  const providedKey = request.headers.get(CORE_API_KEY_HEADER);
  const envKey = process.env.CORE_API_KEY;

  if (!validateCoreApiKey(providedKey, envKey)) {
    return Response.json(
      {
        error: "Unauthorized",
        message: "Invalid or missing X-Core-Api-Key header.",
      },
      { status: 401 },
    );
  }

  // ── 2. Parse body ─────────────────────────────────────────────────────────
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return Response.json(
      { error: "Bad Request", message: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  // ── 3. Validate schema ───────────────────────────────────────────────────
  const parsed = evaluationRequestSchema.safeParse(raw);
  if (!parsed.success) {
    return Response.json(
      {
        error: "Bad Request",
        message: "Invalid request payload.",
        issues: parsed.error.issues,
      },
      { status: 400 },
    );
  }

  // ── 4. Build IO (use override in tests, admin client in production) ───────
  const io = ioOverride ?? buildIO(makeAdminClient());

  // ── 5. Run evaluation pipeline ────────────────────────────────────────────
  const result = await runEvaluation(parsed.data, CORE_CALLER_SERVICE, io);

  return Response.json(result, { status: 200 });
}
