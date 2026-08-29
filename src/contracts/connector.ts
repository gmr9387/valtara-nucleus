/**
 * Connector contracts for the Valtaris ecosystem.
 * These contracts define connector definitions, metadata,
 * runtime binding rules, and execution context used across
 * Glue, DualPay, Guardian, and other runtimes.
 */

export interface ConnectorDefinition {
  id: string;
  name: string;
  description: string;
  version: number;
  type: string; // http, x12, sql, custom
  metadata: Record<string, unknown>;
}

export interface ConnectorCredentialBinding {
  id: string;
  connectorId: string;
  credentialId: string;
  scope: "organization" | "project" | "environment";
  metadata: Record<string, unknown>;
}

export interface ConnectorRuntimeContext {
  connectorId: string;
  credentialId: string;
  environmentId: string;
  metadata: Record<string, unknown>;
}

export interface ConnectorExecutionRequest {
  id: string;
  connectorId: string;
  payload: Record<string, unknown>;
  requestedAt: string;
}

export interface ConnectorExecutionResponse {
  id: string;
  requestId: string;
  connectorId: string;
  output: Record<string, unknown>;
  completedAt: string;
}

export interface ConnectorEvent {
  id: string;
  connectorId: string;
  type: "start" | "step" | "complete" | "error";
  timestamp: string;
  metadata: Record<string, unknown>;
}
