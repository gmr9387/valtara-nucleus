/**
 * ValtariOS Core — Public Entry Point
 *
 * Single import surface for the shared decision engine.
 * Re-exports every Core module so downstream products
 * (Glue, Weaver, Guardian, Cloud, Claim Clarity) bind to
 * stable contracts only.
 */

export * from "./types";
export * from "./contracts";
export { evaluateRules } from "./evaluator";
export type { EvaluatorOutput } from "./evaluator";
export { calculateConfidence } from "./confidence";
export { resolveDecision } from "./decisions";
export { generateTrace } from "./trace";
export { evaluateGovernance } from "./governance";
export { replayEvaluation } from "./replay";

export interface CoreModuleDescriptor {
  readonly name: string;
  readonly purpose: string;
  readonly status: "Architecture Ready";
}

export const CORE_MODULE_REGISTRY: readonly CoreModuleDescriptor[] = [
  {
    name: "types",
    purpose:
      "Foundational decision-engine vocabulary: Decision, ConfidenceBand, Severity, EvaluationMode, TraceRecord, RuleEvaluation, DecisionCandidate.",
    status: "Architecture Ready",
  },
  {
    name: "contracts",
    purpose:
      "Strict TypeScript interfaces for Core requests, responses, and per-module results.",
    status: "Architecture Ready",
  },
  {
    name: "evaluator",
    purpose:
      "Rule execution, condition evaluation, rule firing, candidate generation.",
    status: "Architecture Ready",
  },
  {
    name: "confidence",
    purpose:
      "Data quality, corroboration, contradictions, missing facts, confidence band assignment.",
    status: "Architecture Ready",
  },
  {
    name: "decisions",
    purpose:
      "Vote aggregation, priority weighting, tie breaking, final decision selection.",
    status: "Architecture Ready",
  },
  {
    name: "trace",
    purpose:
      "Rule trace, evaluation trace, audit trace, replay trace.",
    status: "Architecture Ready",
  },
  {
    name: "governance",
    purpose:
      "Rule health, explainability, audit readiness, governance scoring.",
    status: "Architecture Ready",
  },
  {
    name: "replay",
    purpose:
      "Historical replay, diff generation, version comparison, drift detection.",
    status: "Architecture Ready",
  },
] as const;
