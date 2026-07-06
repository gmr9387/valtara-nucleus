/**
 * ValtariOS Core — Rule Evaluator
 *
 * Phase 1 rule: claims-domain high-value appeal requires approval.
 *   - facts.domain === "claims"
 *   - facts.event (or facts.command) contains "appeal" (case-insensitive)
 *   - facts.amount >= 25000
 *
 * All three conditions must be true for the rule to fire.
 */

import type { CoreEvaluationRequest } from "./contracts";
import type { DecisionCandidate, RuleEvaluation } from "./types";

export interface EvaluatorOutput {
  readonly evaluations: readonly RuleEvaluation[];
  readonly candidates: readonly DecisionCandidate[];
}

const RULE_ID = "claims.appeal.high-value-approval";
const RULE_NAME = "High-Value Appeal Requires Approval";
const RULE_VERSION = 1;
const APPROVAL_THRESHOLD = 25_000;

export function evaluateRules(request: CoreEvaluationRequest): EvaluatorOutput {
  const { facts } = request;

  const domain = typeof facts.domain === "string" ? facts.domain : undefined;
  const event =
    typeof facts.event === "string"
      ? facts.event
      : typeof facts.command === "string"
        ? facts.command
        : undefined;
  const amount = typeof facts.amount === "number" ? facts.amount : undefined;

  const domainMatch = domain === "claims";
  const appealMatch = typeof event === "string" && event.toLowerCase().includes("appeal");
  const amountMatch = typeof amount === "number" && amount >= APPROVAL_THRESHOLD;

  const fired = domainMatch && appealMatch && amountMatch;

  let reason: string;
  if (fired) {
    reason = `Appeal event on domain "claims" with amount ${amount} >= ${APPROVAL_THRESHOLD} requires approval.`;
  } else {
    const unmet: string[] = [];
    if (!domainMatch) unmet.push(`domain is "${domain ?? "missing"}" (expected "claims")`);
    if (!appealMatch) unmet.push(`event "${event ?? "missing"}" does not contain "appeal"`);
    if (!amountMatch) unmet.push(`amount ${amount ?? "missing"} < ${APPROVAL_THRESHOLD}`);
    reason = `Rule not fired. Unmet conditions: ${unmet.join("; ")}.`;
  }

  const evaluation: RuleEvaluation = {
    ruleId: RULE_ID,
    ruleVersion: RULE_VERSION,
    ruleName: RULE_NAME,
    fired,
    weight: 1.0,
    reason,
    evidenceRefs: fired && amount !== undefined ? [`amount:${amount}`] : [],
  };

  const candidates: DecisionCandidate[] = fired
    ? [
        {
          outcome: "requires_approval",
          weight: 1.0,
          supportingRules: [RULE_ID],
          contradictingRules: [],
        },
      ]
    : [
        {
          outcome: "approve",
          weight: 0.5,
          supportingRules: [],
          contradictingRules: [],
        },
      ];

  return { evaluations: [evaluation], candidates };
}
