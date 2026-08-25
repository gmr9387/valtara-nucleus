/**
 * Workflow definition client for the Valtaris Glue control plane.
 * Provides deterministic, typed helpers for loading and saving
 * workflow definitions from the UI.
 */

import { WorkflowDefinition } from "./workflow";

export class WorkflowDefinitionClient {
  async load(workflowId: string, version: number): Promise<WorkflowDefinition> {
    const params = new URLSearchParams({
      workflowId,
      version: String(version)
    });

    const res = await fetch(`/workflow/definition/load?${params.toString()}`);
    if (!res.ok) {
      throw new Error(`Failed to load workflow definition: ${res.status}`);
    }

    return (await res.json()) as WorkflowDefinition;
  }

  async save(
    workflowId: string,
    definition: WorkflowDefinition,
    userId: string
  ): Promise<{ version: number }> {
    const res = await fetch(`/workflow/definition/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workflowId,
        definition,
        userId
      })
    });

    if (!res.ok) {
      throw new Error(`Failed to save workflow definition: ${res.status}`);
    }

    return await res.json();
  }
}
