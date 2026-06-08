/**
 * ValtariOS Core — Foundational Types
 *
 * Permanent home for the shared decision engine type vocabulary.
 * No runtime logic. No behavior changes. Definitions only.
 */

export type Severity = "info" | "low" | "medium" | "high" | "critical";

export type ConfidenceBand = "low" | "medium" | "high" | "verified";

export type EvaluationMode = "live" | "replay" | "shadow" | "dry_run";

export type DecisionOutcome =
  | "approve"
  | "reject"
  | "review"
  | "escalate"
  | "defer"
  | "inconclusive";

export interface Decision {
  id: string;
  outcome: DecisionOutcome;
  confidence: ConfidenceBand;
  severity: Severity;
  rationale: string;
  createdAt: string;
}

export interface RuleEvaluation {
  ruleId: string;
  fired: boolean;
  weight: number;
  reason?: string;
  evidenceRefs?: string[];
}

export interface DecisionCandidate {
  outcome: DecisionOutcome;
  weight: number;
  supportingRules: string[];
  contradictingRules: string[];
}

export interface TraceRecord {
  step: string;
  at: string;
  detail?: Record<string, unknown>;
}
