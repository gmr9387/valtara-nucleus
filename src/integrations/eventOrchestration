/**
 * eventOrchestration.ts
 *
 * Swap 34: Unified Event‑Driven Orchestration Layer
 *
 * This module coordinates event-driven triggers across:
 * - Glue workflows
 * - Decision Weaver models
 * - Guardian governance rules
 * - DualPay ledger actions
 */

import { eventBus } from "./eventBus";
import { registerWorkflowTrigger } from "./eventDrivenWorkflow";
import { registerDecisionTrigger } from "./eventDrivenDecision";
import { registerGovernanceTrigger } from "./eventDrivenGovernance";
import { registerLedgerTrigger } from "./eventDrivenLedger";

export type OrchestrationTrigger =
  | {
      subsystem: "workflow";
      eventType: string;
      workflowId: string;
      inputMapper?: (event: any) => any;
    }
  | {
      subsystem: "decision";
      eventType: string;
      modelId: string;
      inputMapper?: (event: any) => any;
    }
  | {
      subsystem: "governance";
      eventType: string;
      ruleId: string;
      inputMapper?: (event: any) => any;
    }
  | {
      subsystem: "ledger";
      eventType: string;
      ledgerAction: string;
      inputMapper?: (event: any) => any;
    };

const orchestrationRegistry = new Map<string, OrchestrationTrigger>();

/**
 * Register unified orchestration trigger
 */
export function registerOrchestrationTrigger(trigger: OrchestrationTrigger) {
  orchestrationRegistry.set(trigger.eventType, trigger);

  switch (trigger.subsystem) {
    case "workflow":
      registerWorkflowTrigger({
        eventType: trigger.eventType,
        workflowId: trigger.workflowId,
        inputMapper: trigger.inputMapper
      });
      break;

    case "decision":
      registerDecisionTrigger({
        eventType: trigger.eventType,
        modelId: trigger.modelId,
        inputMapper: trigger.inputMapper
      });
      break;

    case "governance":
      registerGovernanceTrigger({
        eventType: trigger.eventType,
        ruleId: trigger.ruleId,
        inputMapper: trigger.inputMapper
      });
      break;

    case "ledger":
      registerLedgerTrigger({
        eventType: trigger.eventType,
        ledgerAction: trigger.ledgerAction,
        inputMapper: trigger.inputMapper
      });
      break;
  }
}

/**
 * Debug listener: log orchestration activity
 */
eventBus.subscribe("*", async (event) => {
  const trigger = orchestrationRegistry.get(event.type);
  if (!trigger) return;

  console.log(
    `[Orchestration] Event '${event.type}' routed to subsystem '${trigger.subsystem}'`
  );
});
