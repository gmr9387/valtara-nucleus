/**
 * Workflow contracts for the Valtaris ecosystem.
 * These contracts define the structure of workflow definitions,
 * versions, steps, and metadata used across all runtimes.
 */

export interface WorkflowStep {
  id: string;
  name: string;
  type: "task" | "decision" | "event";
  next: string[]; // ids of next steps
  metadata: Record<string, unknown>;
}

export interface WorkflowVersion {
  id: string;
  version: number;
  definitionId: string;
  steps: WorkflowStep[];
  createdAt: string;
  createdBy: string;
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  activeVersion: number;
  metadata: Record<string, unknown>;
}

export interface WorkflowRunContext {
  runId: string;
  definitionId: string;
  version: number;
  currentStep: string;
  state: Record<string, unknown>;
  startedAt: string;
  updatedAt: string;
}

export interface WorkflowEvent {
  id: string;
  runId: string;
  stepId: string;
  type: "start" | "complete" | "error";
  timestamp: string;
  metadata: Record<string, unknown>;
}
