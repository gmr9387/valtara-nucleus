// src/nucleus/resources/connectorResource.ts

/**
 * Connector Resource (v1)
 *
 * Purpose:
 *   Define the canonical shape, invariants, validation rules,
 *   and dependency rules for Connectors.
 *
 * Connectors belong to Environments.
 * They define integration surfaces and external system access.
 */

import {
  registerResource,
  ResourceDefinition,
  ResourceValidationResult,
} from "./resourceRegistry";

export interface ConnectorV1 {
  id: string;
  environmentId: string; // must reference a valid environment
  type: string; // e.g. "http", "database", "payment", "trading", "custom"
  name: string; // human-readable name
  createdAt: number;

  config: Record<string, any>; // connector-specific configuration
  metadata?: Record<string, any>;
}

/**
 * Invariant:
 *   - id must exist
 *   - environmentId must exist
 *   - type must be non-empty
 *   - name must be non-empty
 *   - createdAt must be a valid timestamp
 *   - config must be an object
 */
function invariant(resource: ConnectorV1): boolean {
  if (!resource) return false;
  if (!resource.id) return false;
  if (!resource.environmentId) return false;
  if (!resource.type || typeof resource.type !== "string") return false;
  if (!resource.name || typeof resource.name !== "string") return false;
  if (typeof resource.createdAt !== "number") return false;
  if (typeof resource.config !== "object") return false;
  return true;
}

/**
 * Validation:
 *   - type must be one of the canonical connector types OR a valid custom type
 *   - config must contain required fields depending on type
 */
function validate(resource: ConnectorV1): ResourceValidationResult {
  const errors: string[] = [];

  const canonical = ["http", "database", "payment", "trading"];

  if (!canonical.includes(resource.type)) {
    // allow custom connector types but enforce naming rules
    if (resource.type.length < 2) {
      errors.push("Custom connector type must be at least 2 characters.");
    }
    if (!/^[a-zA-Z0-9-_]+$/.test(resource.type)) {
      errors.push("Connector type must be alphanumeric with - or _ allowed.");
    }
  }

  // type-specific config validation
  if (resource.type === "http") {
    if (!resource.config.baseUrl) {
      errors.push("http connector requires config.baseUrl");
    }
  }

  if (resource.type === "database") {
    if (!resource.config.connectionString) {
      errors.push("database connector requires config.connectionString");
    }
  }

  if (resource.type === "payment") {
    if (!resource.config.provider) {
      errors.push("payment connector requires config.provider");
    }
  }

  if (resource.type === "trading") {
    if (!resource.config.broker) {
      errors.push("trading connector requires config.broker");
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
 *   Connector depends on Environment.
 */
const dependencies: ResourceDefinition["dependencies"] = ["environment"];

/**
 * Resource Definition
 */
const ConnectorResourceV1: ResourceDefinition = {
  type: "connector",
  version: "v1",
  invariant,
  validate,
  dependencies,
};

/**
 * Register the resource with Nucleus.
 */
registerResource(ConnectorResourceV1);

export { ConnectorResourceV1 };
