/**
 * Workflow instance contracts for the Valtaris Glue engine.
 * Defines deterministic execution state, step-level progress,
 * lifecycle timestamps, and runtime metadata.
 */

export interface WorkflowInstance {
  id: string;
  workflowId: string;
  version: number;
  organizationId: string;
  projectId: string;
  environmentId: string;

  status: WorkflowInstanceStatus;
  currentStepId: string | null;

  createdAt: string;
  startedAt: string | null;
  updatedAt: string;
  completedAt: string | null;

  metadata: Record<string, unknown>;
}

export type WorkflowInstanceStatus =
  | "pending"
  | "running"
  | "paused"
  | "completed"
  | "failed";

export interface WorkflowStepState {
  id: string;
  stepId: string;
  status: WorkflowStepStatus;

  startedAt: string | null;
  completedAt: string | null;

  output: Record<string, unknown> | null;
  error: Record<string, unknown> | null;

  metadata: Record<string, unknown>;
}

export type WorkflowStepStatus =
  | "pending"
  | "running"
  | "completed"
  | "failed";

export interface WorkflowInstanceEvent {
  id: string;
  instanceId: string;
  workflowId: string;
  version: number;

  type:
    | "instance_created"
    | "instance_started"
    | "instance_updated"
    | "instance_completed"
    | "instance_failed"
    | "step_started"
    | "step_completed"
    | "step_failed";

  timestamp: string;
  metadata: Record<string, unknown>;
}
