/**
 * ValtariOS Core — Trace Generation
 *
 * Emits a traceId and one TraceRecord per evaluated rule,
 * capturing: which rule ran, whether it fired, its weight,
 * and the human-readable reason string.
 */

import type { TraceResult } from "./contracts";
import type { RuleEvaluation, TraceRecord } from "./types";

export function generateTrace(evaluations: readonly RuleEvaluation[]): TraceResult {
  const traceId = crypto.randomUUID();
  const now = new Date().toISOString();

  const records: TraceRecord[] = evaluations.map((e) => ({
    traceId,
    step: `rule:${e.ruleId}`,
    at: now,
    detail: {
      ruleName: e.ruleName,
      ruleVersion: e.ruleVersion,
      fired: e.fired,
      weight: e.weight,
      reason: e.reason,
      evidenceRefs: e.evidenceRefs ?? [],
    },
  }));

  return { traceId, evaluations: [...evaluations], records };
}
