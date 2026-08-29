/**
 * Credential contracts for the Valtaris ecosystem.
 * These contracts define credential definitions, scopes,
 * metadata, and usage context used across all runtimes
 * that rely on secure connector execution.
 */

export interface CredentialDefinition {
  id: string;
  name: string;
  description: string;
  type: string; // api_key, oauth2, basic, custom
  metadata: Record<string, unknown>;
  createdAt: string;
  createdBy: string;
}

export interface CredentialScope {
  id: string;
  credentialId: string;
  scope: "organization" | "project" | "environment";
  resourceId: string; // orgId, projectId, or environmentId
  metadata: Record<string, unknown>;
}

export interface CredentialUsageContext {
  credentialId: string;
  connectorId: string;
  environmentId: string;
  metadata: Record<string, unknown>;
}

export interface CredentialEvent {
  id: string;
  credentialId: string;
  type: "created" | "updated" | "revoked" | "error";
  timestamp: string;
  metadata: Record<string, unknown>;
}
