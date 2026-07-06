/**
 * ValtariOS Core — Confidence Calculation
 *
 * Scores how reliable the evaluation is based on:
 *   - Required facts present/missing (each miss deducts 0.25)
 *   - Number of corroborating signals (fired rules)
 *   - Data quality (1.0 if no missing facts, 0.5 otherwise)
 *
 * Confidence band thresholds:
 *   very_high >= 0.80 | high >= 0.60 | medium >= 0.40 | low < 0.40
 */

import type { ConfidenceResult } from "./contracts";
import type { ConfidenceBand, RuleEvaluation } from "./types";

const REQUIRED_FACTS: readonly string[] = ["domain", "amount"];
const MISSING_FACT_PENALTY = 0.25;
const BASE_SCORE = 0.9;

function bandFromScore(score: number): ConfidenceBand {
  if (score >= 0.8) return "very_high";
  if (score >= 0.6) return "high";
  if (score >= 0.4) return "medium";
  return "low";
}

export function calculateConfidence(
  evaluations: readonly RuleEvaluation[],
  facts: Readonly<Record<string, unknown>>,
): ConfidenceResult {
  const missingFacts = REQUIRED_FACTS.filter(
    (f) => !(f in facts) || facts[f] === undefined || facts[f] === null,
  );

  const score = Math.max(0, Math.min(1, BASE_SCORE - missingFacts.length * MISSING_FACT_PENALTY));

  const corroboratingSignals = evaluations.filter((e) => e.fired).length;

  return {
    score,
    band: bandFromScore(score),
    missingFacts,
    contradictions: [],
    corroboratingSignals,
    dataQuality: missingFacts.length === 0 ? 1.0 : 0.5,
  };
}
