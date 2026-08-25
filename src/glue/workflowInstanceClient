/**
 * WorkflowInstanceClient for the Valtaris Glue control plane.
 * Provides deterministic, typed helpers for:
 * - fetching workflow instance metadata
 * - fetching workflow step states
 */

import { WorkflowInstance, WorkflowStepState } from "./workflowInstance";

export class WorkflowInstanceClient {
  async getInstance(instanceId: string): Promise<WorkflowInstance> {
    const res = await fetch(
      `/workflow/instance/get?instanceId=${instanceId}`
    );

    if (!res.ok) {
      throw new Error(`Failed to load workflow instance: ${res.status}`);
    }

    return (await res.json()) as WorkflowInstance;
  }

  async getStepStates(instanceId: string): Promise<WorkflowStepState[]> {
    const res = await fetch(
      `/workflow/instance/steps?instanceId=${instanceId}`
    );

    if (!res.ok) {
      throw new Error(`Failed to load workflow step states: ${res.status}`);
    }

    return (await res.json()) as WorkflowStepState[];
  }
}
