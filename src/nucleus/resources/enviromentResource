// src/nucleus/resources/environmentResource.ts

/**
 * Environment Resource (v1)
 *
 * Purpose:
 *   Define the canonical shape, invariants, validation rules,
 *   and dependency rules for Environments.
 *
 * Environments belong to Projects.
 */

import {
  registerResource,
  ResourceDefinition,
  ResourceValidationResult,
} from "./resourceRegistry";

export interface EnvironmentV1 {
  id: string;
  projectId: string; // must reference a valid project
  name: string; // e.g. "dev", "test", "stage", "prod"
  createdAt: number;
  metadata?: Record<string, any>;
}

/**
 * Invariant:
 *   - id must exist
 *   - projectId must exist
 *   - name must be non-empty
 *   - createdAt must be a valid timestamp
 */
function invariant(resource: EnvironmentV1): boolean {
  if (!resource) return false;
  if (!resource.id) return false;
  if (!resource.projectId) return false;
  if (!resource.name || typeof resource.name !== "string") return false;
  if (typeof resource.createdAt !== "number") return false;
  return true;
}

/**
 * Validation:
 *   - name must be one of the canonical environment types OR a valid custom name
 *   - metadata must be an object if present
 */
function validate(resource: EnvironmentV1): ResourceValidationResult {
  const errors: string[] = [];

  const canonical = ["dev", "test", "stage", "prod"];

  if (!canonical.includes(resource.name)) {
    // allow custom names but enforce length + characters
    if (resource.name.length < 2) {
      errors.push("Custom environment name must be at least 2 characters.");
    }
    if (!/^[a-zA-Z0-9-_]+$/.test(resource.name)) {
      errors.push("Environment name must be alphanumeric with - or _ allowed.");
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
 *   Environment depends on Project.
 */
const dependencies: ResourceDefinition["dependencies"] = ["project"];

/**
 * Resource Definition
 */
const EnvironmentResourceV1: ResourceDefinition = {
  type: "environment",
  version: "v1",
  invariant,
  validate,
  dependencies,
};

/**
 * Register the resource with Nucleus.
 */
registerResource(EnvironmentResourceV1);

export { EnvironmentResourceV1 };
