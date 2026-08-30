/**
 * Workflow Execute Client for the Valtaris Glue control plane.
 * Provides deterministic, typed helpers for:
 * - fetching workflow metadata
 * - listing workflows
 */

export interface WorkflowMetadata {
  id: string;
  name: string;
  activeVersion: number;
  organizationId?: string;
  projectId?: string;
  environmentId?: string;
  createdAt?: string;
}

export class WorkflowExecuteClient {
  async getWorkflow(id: string): Promise<WorkflowMetadata> {
    const res = await fetch(`/workflow/get?id=${id}`);

    if (!res.ok) {
      throw new Error(`Failed to load workflow metadata: ${res.status}`);
    }

    return (await res.json()) as WorkflowMetadata;
  }

  async listWorkflows(): Promise<WorkflowMetadata[]> {
    const res = await fetch(`/workflow/list`);

    if (!res.ok) {
      throw new Error(`Failed to list workflows: ${res.status}`);
    }

    return (await res.json()) as WorkflowMetadata[];
  }
}
