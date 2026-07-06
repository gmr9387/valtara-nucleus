/**
 * ValtariOS Core — Decision Resolution
 *
 * Selects the winning outcome from candidates by weight (highest wins).
 * On a tie, the first candidate in insertion order is chosen and
 * tieBreaker is set to "first-wins".
 */

import type { DecisionResult } from "./contracts";
import type { ConfidenceBand, DecisionCandidate, Severity } from "./types";

function bandFromWeight(weight: number): ConfidenceBand {
  if (weight >= 0.8) return "very_high";
  if (weight >= 0.6) return "high";
  if (weight >= 0.4) return "medium";
  return "low";
}

function severityFromOutcome(outcome: string): Severity {
  switch (outcome) {
    case "requires_approval":
    case "escalate":
      return "high";
    case "deny":
    case "flag":
      return "medium";
    default:
      return "info";
  }
}

export function resolveDecision(candidates: readonly DecisionCandidate[]): DecisionResult {
  if (candidates.length === 0) {
    return {
      decision: {
        id: crypto.randomUUID(),
        outcome: "unresolved",
        confidence: 0,
        confidenceBand: "low",
        severity: "info",
        rationale: "No candidates produced by evaluator.",
        createdAt: new Date().toISOString(),
      },
      candidates: [],
    };
  }

  const sorted = [...candidates].sort((a, b) => b.weight - a.weight);
  const winner = sorted[0];
  const isTie = sorted.length > 1 && sorted[0].weight === sorted[1].weight;

  const supporting = winner.supportingRules.length > 0 ? winner.supportingRules.join(", ") : "none";

  return {
    decision: {
      id: crypto.randomUUID(),
      outcome: winner.outcome,
      confidence: winner.weight,
      confidenceBand: bandFromWeight(winner.weight),
      severity: severityFromOutcome(winner.outcome),
      rationale: `Outcome "${winner.outcome}" selected with weight ${winner.weight}. Supporting rules: ${supporting}.`,
      createdAt: new Date().toISOString(),
    },
    candidates: [...candidates],
    tieBreaker: isTie ? "first-wins" : undefined,
  };
}
