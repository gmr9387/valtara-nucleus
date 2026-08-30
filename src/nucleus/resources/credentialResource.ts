// src/nucleus/resources/credentialResource.ts

/**
 * Credential Resource (v1)
 *
 * Purpose:
 *   Define the canonical shape, invariants, validation rules,
 *   and dependency rules for Credentials.
 *
 * Credentials belong to Connectors.
 * They are the most sensitive resource in the control plane.
 */

import {
  registerResource,
  ResourceDefinition,
  ResourceValidationResult,
} from "./resourceRegistry";

export interface CredentialV1 {
  id: string;
  connectorId: string; // must reference a valid connector
  type: string; // e.g. "api-key", "oauth", "basic-auth", "jwt", "custom"
  createdAt: number;

  secret: Record<string, any>; // encrypted secret payload
  metadata?: Record<string, any>;
}

/**
 * Invariant:
 *   - id must exist
 *   - connectorId must exist
 *   - type must be non-empty
 *   - createdAt must be a valid timestamp
 *   - secret must be an object
 *
 *   CRITICAL:
 *   - secret MUST NOT be empty
 *   - secret MUST NOT contain plaintext credentials
 */
function invariant(resource: CredentialV1): boolean {
  if (!resource) return false;
  if (!resource.id) return false;
  if (!resource.connectorId) return false;
  if (!resource.type || typeof resource.type !== "string") return false;
  if (typeof resource.createdAt !== "number") return false;
  if (typeof resource.secret !== "object") return false;

  // secret must contain encrypted material
  if (Object.keys(resource.secret).length === 0) return false;

  // enforce encrypted fields only
  for (const key of Object.keys(resource.secret)) {
    if (typeof resource.secret[key] !== "string") return false;
    if (!resource.secret[key].startsWith("enc:")) return false;
  }

  return true;
}

/**
 * Validation:
 *   - type must be one of the canonical credential types OR a valid custom type
 *   - metadata must be an object if present
 */
function validate(resource: CredentialV1): ResourceValidationResult {
  const errors: string[] = [];

  const canonical = ["api-key", "oauth", "basic-auth", "jwt"];

  if (!canonical.includes(resource.type)) {
    // allow custom credential types but enforce naming rules
    if (resource.type.length < 2) {
      errors.push("Custom credential type must be at least 2 characters.");
    }
    if (!/^[a-zA-Z0-9-_]+$/.test(resource.type)) {
      errors.push("Credential type must be alphanumeric with - or _ allowed.");
    }
  }

  if (resource.metadata && typeof resource.metadata !== "object") {
    errors.push("metadata must be an object.");
  }

  return {
    ok: errors.length === 0,
    errors: errors.length ? errors : undefined,
  };
}

/**
 * Dependencies:
 *   Credential depends on Connector.
 */
const dependencies: ResourceDefinition["dependencies"] = ["connector"];

/**
 * Resource Definition
 */
const CredentialResourceV1: ResourceDefinition = {
  type: "credential",
  version: "v1",
  invariant,
  validate,
  dependencies,
};

/**
 * Register the resource with Nucleus.
 */
registerResource(CredentialResourceV1);

export { CredentialResourceV1 };
