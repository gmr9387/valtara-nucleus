/**
 * ValtariOS Core — Governance Evaluation
 *
 * auditReady is true when:
 *   - A non-empty traceId was generated, AND
 *   - At least one rule was evaluated (evaluations not empty), AND
 *   - Every evaluated rule has a reason string (explainability)
 *
 * Caller-identity presence is checked externally by the server function
 * and recorded in the audit log; governance here reflects structural
 * readiness of the evaluation artifact itself.
 */

import type { GovernanceResult, TraceResult } from "./contracts";

export function evaluateGovernance(trace: TraceResult): GovernanceResult {
  const hasTrace = typeof trace.traceId === "string" && trace.traceId.length > 0;
  const hasEvaluations = trace.evaluations.length > 0;
  const explainable =
    hasEvaluations &&
    trace.evaluations.every((e) => typeof e.reason === "string" && e.reason.length > 0);

  const auditReady = hasTrace && hasEvaluations && explainable;

  const checks = [hasTrace, hasEvaluations, explainable, auditReady];
  const score = checks.filter(Boolean).length / checks.length;

  const findings: string[] = [];
  if (!hasTrace) findings.push("No traceId generated.");
  if (!hasEvaluations) findings.push("No rules were evaluated.");
  if (!explainable) findings.push("One or more rules are missing a reason field.");

  return {
    score,
    severity: score >= 0.75 ? "info" : "medium",
    explainable,
    auditReady,
    findings,
  };
}
