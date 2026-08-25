/**
 * Environment resource contracts for the Valtaris ecosystem.
 * These contracts define environment structure, metadata,
 * and events used across the control plane. Environments
 * provide execution context for workflows, decisions,
 * reimbursement evaluations, connectors, and credentials.
 */

export interface Environment {
  id: string;
  projectId: string;
  name: string;
  description: string;
  type: "dev" | "test" | "prod";
  createdAt: string;
  createdBy: string;
  metadata: Record<string, unknown>;
}

export interface EnvironmentVariable {
  id: string;
  environmentId: string;
  key: string;
  value: string;
  createdAt: string;
  metadata: Record<string, unknown>;
}

export interface EnvironmentEvent {
  id: string;
  environmentId: string;
  type: "created" | "updated" | "variable_added" | "variable_removed" | "error";
  timestamp: string;
  metadata: Record<string, unknown>;
}
