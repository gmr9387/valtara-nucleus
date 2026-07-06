/**
 * ValtariOS Core — Evaluation Engine
 *
 * Pure orchestration layer: no Supabase, no browser, no I/O.
 * I/O (audit + telemetry writes) is injected via CoreEvaluationIO so
 * this module is fully testable without any mocking of Supabase clients.
 *
 * Call hierarchy:
 *   runEvaluation()
 *     → evaluateRules()      – fires rules against request.facts
 *     → calculateConfidence() – scores data quality + missing facts
 *     → resolveDecision()    – picks winning candidate by weight
 *     → generateTrace()      – builds traceId + per-rule records
 *     → evaluateGovernance() – asserts audit readiness
 *     → io.writeAudit()      – best-effort, non-blocking
 *     → io.writeTelemetry()  – best-effort, non-blocking
 */

import type { CoreEvaluationRequest, CoreEvaluationResponse } from "./contracts";
import type { GlueDispatchResult } from "./glue-dispatch";
import { evaluateRules } from "./evaluator";
import { calculateConfidence } from "./confidence";
import { resolveDecision } from "./decisions";
import { generateTrace } from "./trace";
import { evaluateGovernance } from "./governance";

export interface CoreEvaluationIO {
  writeAudit: (args: {
    traceId: string;
    outcome: string;
    callerIdentity: string;
    organizationId: string | null | undefined;
    correlationId: string | null | undefined;
    confidenceScore: number;
    dispatch?: GlueDispatchResult;
  }) => Promise<void>;
  writeTelemetry: (args: {
    traceId: string;
    module: string;
    durationMs: number;
    outcome: string;
    organizationId: string | null | undefined;
    dispatch?: GlueDispatchResult;
  }) => Promise<void>;
  /**
   * Best-effort Glue workflow dispatch. Called only when outcome = "requires_approval".
   * Optional — if not provided, dispatch is skipped.
   */
  dispatchGlueWorkflow?: (args: {
    organizationId: string;
    subjectId: string;
    correlationId: string;
    payload: Record<string, unknown>;
  }) => Promise<GlueDispatchResult>;
}

export async function runEvaluation(
  request: CoreEvaluationRequest,
  callerIdentity: string,
  io: CoreEvaluationIO,
): Promise<CoreEvaluationResponse> {
  const t0 = Date.now();

  const { evaluations, candidates } = evaluateRules(request);
  const confidence = calculateConfidence(evaluations, request.facts);
  const decisionResult = resolveDecision(candidates);
  const trace = generateTrace(evaluations);
  const governance = evaluateGovernance(trace);

  const durationMs = Date.now() - t0;

  // ── Best-effort Glue dispatch ─────────────────────────────────────────────
  // Only triggered for requires_approval. Never throws into caller.
  let dispatch: GlueDispatchResult | undefined;
  if (decisionResult.decision.outcome === "requires_approval" && io.dispatchGlueWorkflow) {
    dispatch = await io
      .dispatchGlueWorkflow({
        organizationId: request.organizationId,
        subjectId: request.subjectId,
        // Fall back to traceId when the caller did not supply a correlationId,
        // so Glue always has a stable idempotency key.
        correlationId: request.correlationId ?? trace.traceId,
        payload: { ...(request.facts as Record<string, unknown>) },
      })
      .catch((err: unknown) => {
        const error = `dispatchGlueWorkflow threw: ${String(err)}`;
        if (typeof process !== "undefined" && process.env.NODE_ENV !== "test") {
          console.warn("[core:engine] Glue dispatch threw", err);
        }
        return { status: "failed" as const, error };
      });
  }

  // Best-effort I/O — intentionally non-blocking; never throws into caller.
  void io
    .writeAudit({
      traceId: trace.traceId,
      outcome: decisionResult.decision.outcome,
      callerIdentity,
      organizationId: request.organizationId,
      correlationId: request.correlationId,
      confidenceScore: confidence.score,
      dispatch,
    })
    .catch((err: unknown) => {
      if (typeof process !== "undefined" && process.env.NODE_ENV !== "test") {
        console.warn("[core:engine] audit write failed", err);
      }
    });

  void io
    .writeTelemetry({
      traceId: trace.traceId,
      module: "core",
      durationMs,
      outcome: decisionResult.decision.outcome,
      organizationId: request.organizationId,
      dispatch,
    })
    .catch((err: unknown) => {
      if (typeof process !== "undefined" && process.env.NODE_ENV !== "test") {
        console.warn("[core:engine] telemetry write failed", err);
      }
    });

  return {
    decision: decisionResult,
    confidence,
    trace,
    governance,
    dispatch,
  };
}
