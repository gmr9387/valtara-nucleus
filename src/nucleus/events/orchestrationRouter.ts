// src/nucleus/events/orchestrationRouter.ts

import { NucleusEvent } from "../contracts/NucleusEvent";
import { findSubsystemsWith } from "../capabilityRegistry";
import { publishEvent } from "./eventBus";

/**
 * Orchestration Router
 *
 * Nucleus = KNOW
 * Weaver = FIND
 * Guardian = ALLOW
 * Glue = DO
 * DualPay = SPECIALIZE
 *
 * This router determines:
 *   “Given this event, which subsystem has the capability to respond?”
 *
 * It does NOT execute.
 * It does NOT authorize.
 * It does NOT discover.
 * It ONLY routes.
 */

export interface OrchestrationRule {
  eventType: string;
  capability: string; // capability name from capabilityRegistry
}

const rules: OrchestrationRule[] = [];

/**
 * registerOrchestrationRule
 *
 * Allows Nucleus to declare:
 *   “When event X occurs, capability Y should respond.”
 */
export function registerOrchestrationRule(rule: OrchestrationRule) {
  rules.push(rule);
}

/**
 * routeEvent
 *
 * Nucleus receives an event → determines which subsystem(s) have the capability → emits a routed event.
 */
export async function routeEvent(event: NucleusEvent) {
  const matching = rules.filter((r) => r.eventType === event.type);

  for (const rule of matching) {
    const subsystems = findSubsystemsWith(rule.capability);

    for (const subsystem of subsystems) {
      await publishEvent({
        ...event,
        type: `routed.${rule.capability}`,
        source: `nucleus.router → ${subsystem}`,
      });
    }
  }
}
