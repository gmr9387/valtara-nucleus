/**
 * nucleusGovernance.ts
 *
 * Swap 43: Unified Subsystem Governance Layer
 *
 * Provides global governance rules and cross-subsystem enforcement.
 */

import { guardianIntegration } from "./guardianIntegration";
import { NucleusIdentity } from "./identityBinding";

export interface GlobalRule {
  id: string;
  description: string;
  appliesTo: ("workflow" | "decision" | "ledger" | "event")[];
  evaluate: (payload: any, identity: NucleusIdentity) => Promise<boolean>;
}

const globalRules = new Map<string, GlobalRule>();

export function registerGlobalRule(rule: GlobalRule) {
  globalRules.set(rule.id, rule);
}

export async function evaluateGlobalGovernance(
  subsystem: string,
  payload: any,
  identity: NucleusIdentity
) {
  for (const rule of globalRules.values()) {
    if (!rule.appliesTo.includes(subsystem as any)) continue;

    const allowed = await rule.evaluate(payload, identity);

    await guardianIntegration.evaluateRule(rule.id, payload, identity);

    if (!allowed) {
      return {
        allowed: false,
        ruleId: rule.id,
        reason: "Global governance rule denied operation"
      };
    }
  }

  return { allowed: true };
}
