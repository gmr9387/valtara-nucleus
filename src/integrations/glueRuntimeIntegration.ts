/**
 * glueRuntimeIntegration.ts
 *
 * Full file replacement — Swap 35
 *
 * This version includes:
 * - Durable workflow state sync to Supabase
 * - Event-driven lifecycle logging
 * - Step completion tracking
 * - Error propagation + durable error logging
 * - Identity propagation
 * - Architectural alignment with Glue 9.x runtime
 */

import { syncWorkflowState } from "./supabase/workflowSync";
import { eventBus } from "./eventBus";
import { NucleusIdentity } from "./identityBinding";

export interface WorkflowStartOptions {
  workflowId: string;
  input: any;
  identity: NucleusIdentity;
}

export interface WorkflowStepOptions {
  workflowId: string;
  instanceId: string;
  stepId: string;
  input: any;
  identity: NucleusIdentity;
}

export interface WorkflowCompletionOptions {
  workflowId: string;
  instanceId: string;
  identity: NucleusIdentity;
}

export interface WorkflowFailureOptions {
  workflowId: string;
  instanceId: string;
  error: any;
  identity: NucleusIdentity;
}

export const glueRuntimeIntegration = {
  /**
   * Start a workflow instance
   */
  async startWorkflow(workflowId: string, input: any, identity: NucleusIdentity) {
    const instanceId = crypto.randomUUID();

    // Durable sync
    await syncWorkflowState({
      workflowId,
      instanceId,
      status: "started",
      payload: input,
      identity
    });

    // Event bus
    await eventBus.publishEvent({
      id: crypto.randomUUID(),
      source: "glue",
      type: "workflow.started",
      context: {
        tenantId: identity.tenantId,
        projectId: identity.projectId,
        actor: identity.actor
      },
      payload: {
        workflowId,
        instanceId,
        input
      },
      timestamp: new Date().toISOString()
    });

    return { instanceId };
  },

  /**
   * Complete a workflow step
   */
  async completeStep(
    workflowId: string,
    instanceId: string,
    stepId: string,
    output: any,
    identity: NucleusIdentity
  ) {
    // Durable sync
    await syncWorkflowState({
      workflowId,
      instanceId,
      stepId,
      status: "step.completed",
      payload: output,
      identity
    });

    // Event bus
    await eventBus.publishEvent({
      id: crypto.randomUUID(),
      source: "glue",
      type: "workflow.step.completed",
      context: {
        tenantId: identity.tenantId,
        projectId: identity.projectId,
        actor: identity.actor
      },
      payload: {
        workflowId,
        instanceId,
        stepId,
        output
      },
      timestamp: new Date().toISOString()
    });
  },

  /**
   * Complete workflow
   */
  async completeWorkflow(
    workflowId: string,
    instanceId: string,
    identity: NucleusIdentity
  ) {
    // Durable sync
    await syncWorkflowState({
      workflowId,
      instanceId,
      status: "completed",
      identity
    });

    // Event bus
    await eventBus.publishEvent({
      id: crypto.randomUUID(),
      source: "glue",
      type: "workflow.completed",
      context: {
        tenantId: identity.tenantId,
        projectId: identity.projectId,
        actor: identity.actor
      },
      payload: {
        workflowId,
        instanceId
      },
      timestamp: new Date().toISOString()
    });
  },

  /**
   * Fail workflow
   */
  async failWorkflow(
    workflowId: string,
    instanceId: string,
    error: any,
    identity: NucleusIdentity
  ) {
    // Durable sync
    await syncWorkflowState({
      workflowId,
      instanceId,
      status: "error",
      payload: { error },
      identity
    });

    // Event bus
    await eventBus.publishEvent({
      id: crypto.randomUUID(),
      source: "glue",
      type: "workflow.error",
      context: {
        tenantId: identity.tenantId,
        projectId: identity.projectId,
        actor: identity.actor
      },
      payload: {
        workflowId,
        instanceId,
        error
      },
      timestamp: new Date().toISOString()
    });
  }
};
