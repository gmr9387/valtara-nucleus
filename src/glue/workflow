/**
 * Workflow resource contracts for the Valtaris Glue engine.
 * Defines workflow structure, metadata, versioning, and
 * deterministic execution configuration.
 */

export interface Workflow {
  id: string;
  organizationId: string;
  projectId: string;
  environmentId: string;
  name: string;
  description: string;
  activeVersion: number;
  createdAt: string;
  createdBy: string;
  metadata: Record<string, unknown>;
}

export interface WorkflowVersion {
  id: string;
  workflowId: string;
  version: number;
  definition: WorkflowDefinition;
  createdAt: string;
  createdBy: string;
  metadata: Record<string, unknown>;
}

export interface WorkflowDefinition {
  steps: WorkflowStep[];
  triggers: WorkflowTrigger[];
  metadata: Record<string, unknown>;
}

export interface WorkflowStep {
  id: string;
  type: string; // task, decision, connector_call, delay, branch
  name: string;
  config: Record<string, unknown>;
  metadata: Record<string, unknown>;
}

export interface WorkflowTrigger {
  id: string;
  type: string; // http, schedule, event
  config: Record<string, unknown>;
  metadata: Record<string, unknown>;
}

export interface WorkflowEvent {
  id: string;
  workflowId: string;
  version: number;
  type: "created" | "updated" | "version_added" | "version_removed" | "executed" | "error";
  timestamp: string;
  metadata: Record<string, unknown>;
}
