/**
 * eventDrivenGovernance.ts
 *
 * Swap 32: Event‑Driven Governance Trigger Layer
 *
 * This module listens to Nucleus events and triggers Guardian rule evaluations.
 */

import { eventBus } from "./eventBus";
import { guardianIntegration } from "./guardianIntegration";
import { NucleusIdentity } from "./identityBinding";

interface GovernanceTriggerConfig {
  eventType: string;
  ruleId: string;
  inputMapper?: (event: any) => any;
}

const governanceTriggers = new Map<string, GovernanceTriggerConfig>();

/**
 * Register a governance trigger
 */
export function registerGovernanceTrigger(config: GovernanceTriggerConfig) {
  governanceTriggers.set(config.eventType, config);
}

/**
 * Bind event bus listener for explicit governance triggers
 */
eventBus.subscribe("governance.trigger", async (event) => {
  const config = governanceTriggers.get(event.type);
  if (!config) return;

  const identity: NucleusIdentity = event.context;

  const input = config.inputMapper
    ? config.inputMapper(event)
    : event.payload;

  await guardianIntegration.evaluateRule(
    config.ruleId,
    input,
    identity
  );
});

/**
 * Generic listener for any event → governance trigger
 */
eventBus.subscribe("*", async (event) => {
  const config = governanceTriggers.get(event.type);
  if (!config) return;

  const identity: NucleusIdentity = event.context;

  const input = config.inputMapper
    ? config.inputMapper(event)
    : event.payload;

  await guardianIntegration.evaluateRule(
    config.ruleId,
    input,
    identity
  );
});
