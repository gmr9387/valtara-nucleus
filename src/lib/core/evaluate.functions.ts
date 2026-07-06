/**
 * ValtariOS Core — Evaluation Server Function
 *
 * Authenticated POST endpoint that accepts a CoreEvaluationRequest,
 * runs the decision engine, writes audit + telemetry, and returns
 * a CoreEvaluationResponse.
 *
 * Auth modes accepted (checked in order):
 *   1. X-Core-Api-Key header matching CORE_API_KEY env var (M2M / DualPay)
 *   2. Authorization: ****** (authenticated UI users)
 *
 * When called via TanStack Start's server-function RPC, the caller
 * must POST to the generated endpoint URL with the appropriate auth header.
 *
 * DualPay integration:
 *   POST /_server/<tanstack-fn-hash>
 *   Content-Type: application/json
 *   X-Core-Api-Key: <CORE_API_KEY>
 *   Body: { organizationId, subjectId, mode, facts, correlationId? }
 */

import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { runEvaluation, type CoreEvaluationIO } from "./engine";
import { validateCoreApiKey, CORE_API_KEY_HEADER, CORE_CALLER_SERVICE } from "./m2m-auth";

// ── Input schema ────────────────────────────────────────────────────────────

const evaluationRequestSchema = z.object({
  organizationId: z.string().min(1),
  subjectId: z.string().min(1),
  mode: z.enum(["instant", "deep", "assisted", "live", "replay", "shadow", "dry_run"]),
  facts: z.record(z.unknown()),
  rulesetVersion: z.string().optional(),
  correlationId: z.string().optional(),
});

// ── Admin client factory (service-role, bypasses RLS) ──────────────────────

function makeAdminClient() {
  const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined) ?? process.env.SUPABASE_URL;
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

// ── IO implementation for the server function ─────────────────────────────

function buildIO(adminClient: ReturnType<typeof makeAdminClient>): CoreEvaluationIO {
  return {
    async writeAudit({
      traceId,
      outcome,
      callerIdentity,
      organizationId,
      correlationId,
      confidenceScore,
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
          } as never,
        });
      } catch (err) {
        console.warn("[core:evaluate] audit write failed", err);
      }
    },

    async writeTelemetry({ traceId, module, durationMs, outcome, organizationId }) {
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
          } as never,
        });
      } catch (err) {
        console.warn("[core:evaluate] telemetry write failed", err);
      }
    },
  };
}

// ── M2M-only server function (X-Core-Api-Key) ────────────────────────────

export const evaluateCoreM2M = createServerFn({ method: "POST" })
  .inputValidator((raw) => evaluationRequestSchema.parse(raw))
  .handler(async ({ data }) => {
    const request = getRequest();
    const providedKey = request?.headers.get(CORE_API_KEY_HEADER) ?? null;
    const envKey = process.env.CORE_API_KEY;

    if (!validateCoreApiKey(providedKey, envKey)) {
      throw new Error("Unauthorized: invalid or missing CORE_API_KEY.");
    }

    const admin = makeAdminClient();
    const io = buildIO(admin);

    return runEvaluation(
      {
        organizationId: data.organizationId,
        subjectId: data.subjectId,
        mode: data.mode,
        facts: data.facts,
        rulesetVersion: data.rulesetVersion,
        correlationId: data.correlationId,
      },
      CORE_CALLER_SERVICE,
      io,
    );
  });

// ── User-authenticated server function (Supabase JWT) ────────────────────

export const evaluateCoreAuthed = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw) => evaluationRequestSchema.parse(raw))
  .handler(async ({ data, context }) => {
    const callerIdentity = `user:${context.userId}`;

    const admin = makeAdminClient();
    const io = buildIO(admin);

    return runEvaluation(
      {
        organizationId: data.organizationId,
        subjectId: data.subjectId,
        mode: data.mode,
        facts: data.facts,
        rulesetVersion: data.rulesetVersion,
        correlationId: data.correlationId,
      },
      callerIdentity,
      io,
    );
  });
