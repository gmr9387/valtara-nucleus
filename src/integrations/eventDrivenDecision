/**
 * eventDrivenDecision.ts
 *
 * Swap 31: Event‑Driven Decision Trigger Layer
 *
 * This module listens to Nucleus events and triggers Decision Weaver models.
 */

import { eventBus } from "./eventBus";
import { decisionWeaverIntegration } from "./decisionWeaverIntegration";
import { NucleusIdentity } from "./identityBinding";

interface DecisionTriggerConfig {
  eventType: string;
  modelId: string;
  inputMapper?: (event: any) => any;
}

const decisionTriggers = new Map<string, DecisionTriggerConfig>();

/**
 * Register a decision trigger
 */
export function registerDecisionTrigger(config: DecisionTriggerConfig) {
  decisionTriggers.set(config.eventType, config);
}

/**
 * Bind event bus listener for explicit decision triggers
 */
eventBus.subscribe("decision.trigger", async (event) => {
  const config = decisionTriggers.get(event.type);
  if (!config) return;

  const identity: NucleusIdentity = event.context;

  const input = config.inputMapper
    ? config.inputMapper(event)
    : event.payload;

  await decisionWeaverIntegration.evaluateModel(
    config.modelId,
    input,
    identity
  );
});

/**
 * Generic listener for any event → decision trigger
 */
eventBus.subscribe("*", async (event) => {
  const config = decisionTriggers.get(event.type);
  if (!config) return;

  const identity: NucleusIdentity = event.context;

  const input = config.inputMapper
    ? config.inputMapper(event)
    : event.payload;

  await decisionWeaverIntegration.evaluateModel(
    config.modelId,
    input,
    identity
  );
});
