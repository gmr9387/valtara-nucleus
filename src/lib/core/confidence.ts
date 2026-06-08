/**
 * ValtariOS Core — Confidence Calculation
 *
 * Responsibilities (future home; no logic moved yet):
 *  - Data quality scoring
 *  - Corroboration across independent facts
 *  - Contradiction detection
 *  - Missing-fact penalties
 *  - Confidence band assignment (low / medium / high / verified)
 *
 * Status: Architecture Ready. Placeholder only.
 */

import type { ConfidenceResult } from "./contracts";
import type { RuleEvaluation } from "./types";

export function calculateConfidence(
  _evaluations: readonly RuleEvaluation[],
  _facts: Readonly<Record<string, unknown>>,
): ConfidenceResult {
  return {
    band: "low",
    score: 0,
    missingFacts: [],
    contradictions: [],
  };
}
