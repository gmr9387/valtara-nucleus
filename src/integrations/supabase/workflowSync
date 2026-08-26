/**
 * workflowSync.ts
 *
 * Swap 35: Workflow Sync → Supabase
 *
 * This module persists Glue workflow state into Supabase.
 */

import { logEvent } from "./rpc/logEvent";
import { logTelemetry } from "./rpc/logTelemetry";
import { logError } from "./rpc/logError";
import { NucleusIdentity } from "../identityBinding";

export interface WorkflowStateSync {
  workflowId: string;
  instanceId: string;
  stepId?: string;
  status: "started" | "step.completed" | "completed" | "error";
  payload?: any;
  identity: NucleusIdentity;
}

/**
 * Persist workflow state to Supabase
 */
export async function syncWorkflowState(state: WorkflowStateSync) {
  const event = {
    id: crypto.randomUUID(),
    source: "glue",
    type: `workflow.${state.status}`,
    context: {
      tenantId: state.identity.tenantId,
      projectId: state.identity.projectId,
      actor: state.identity.actor
    },
    payload: {
      workflowId: state.workflowId,
      instanceId: state.instanceId,
      stepId: state.stepId,
      payload: state.payload
    },
    timestamp: new Date().toISOString()
  };

  try {
    await logEvent(event);

    await logTelemetry({
      id: crypto.randomUUID(),
      subsystem: "glue",
      level: "info",
      message: `Workflow ${state.status}`,
      metadata: event.context,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    await logError({
      id: crypto.randomUUID(),
      subsystem: "glue",
      code: "WORKFLOW_SYNC_FAILED",
      message: err.message,
      context: event.context,
      timestamp: new Date().toISOString()
    });

    throw err;
  }
}
