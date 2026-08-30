// src/nucleus/events/orchestrationRouter.ts
// Full file — Unified Constitutional Orchestration Router

import { NucleusEvent } from "../contracts/NucleusEvent";
import { findSubsystemsWith } from "../capabilityRegistry";
import { publishEvent } from "./eventBus";

/**
 * Orchestration Router
 *
 * Nucleus = KNOW
 * Routes events based on capabilities, not subsystems.
 */

export interface OrchestrationRule {
  eventType: string;
  capability: string;
}

const rules: OrchestrationRule[] = [];

/**
 * registerOrchestrationRule(rule)
 *
 * Declares:
 *   “When event X occurs, capability Y should respond.”
 */
export function registerOrchestrationRule(rule: OrchestrationRule) {
  rules.push(rule);
}

/**
 * routeEvent(event)
 *
 * Nucleus receives an event → determines which subsystem(s)
 * have the capability → emits a routed event.
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
