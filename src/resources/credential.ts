/**
 * Credential resource contracts for the Valtaris ecosystem.
 * These contracts define credential structure, scope bindings,
 * metadata, and events used across the control plane.
 */

export interface Credential {
  id: string;
  organizationId: string;
  projectId: string;
  environmentId: string;
  name: string;
  description: string;
  type: string; // api_key, oauth2, basic, custom
  createdAt: string;
  createdBy: string;
  metadata: Record<string, unknown>;
}

export interface CredentialScopeBinding {
  id: string;
  credentialId: string;
  scope: "organization" | "project" | "environment";
  resourceId: string; // orgId, projectId, or environmentId
  createdAt: string;
  metadata: Record<string, unknown>;
}

export interface CredentialSecret {
  id: string;
  credentialId: string;
  key: string;
  value: string;
  createdAt: string;
  metadata: Record<string, unknown>;
}

export interface CredentialEvent {
  id: string;
  credentialId: string;
  type: "created" | "updated" | "secret_added" | "secret_removed" | "scope_changed" | "error";
  timestamp: string;
  metadata: Record<string, unknown>;
}
