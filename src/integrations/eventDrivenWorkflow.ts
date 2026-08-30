/**
 * eventDrivenWorkflow.ts
 *
 * Swap 30: Event‑Driven Workflow Trigger Layer
 *
 * This module listens to Nucleus events and triggers Glue workflows.
 */

import { eventBus } from "./eventBus";
import { glueRuntimeIntegration } from "./glueRuntimeIntegration";
import { NucleusIdentity } from "./identityBinding";

interface WorkflowTriggerConfig {
  eventType: string;
  workflowId: string;
  inputMapper?: (event: any) => any;
}

const workflowTriggers = new Map<string, WorkflowTriggerConfig>();

/**
 * Register a workflow trigger
 */
export function registerWorkflowTrigger(config: WorkflowTriggerConfig) {
  workflowTriggers.set(config.eventType, config);
}

/**
 * Bind event bus listener
 */
eventBus.subscribe("workflow.trigger", async (event) => {
  const config = workflowTriggers.get(event.type);
  if (!config) return;

  const identity: NucleusIdentity = event.context;

  const input = config.inputMapper
    ? config.inputMapper(event)
    : event.payload;

  await glueRuntimeIntegration.startWorkflow(
    config.workflowId,
    input,
    identity
  );
});

/**
 * Generic listener for any event → workflow trigger
 */
eventBus.subscribe("*", async (event) => {
  const config = workflowTriggers.get(event.type);
  if (!config) return;

  const identity: NucleusIdentity = event.context;

  const input = config.inputMapper
    ? config.inputMapper(event)
    : event.payload;

  await glueRuntimeIntegration.startWorkflow(
    config.workflowId,
    input,
    identity
  );
});
