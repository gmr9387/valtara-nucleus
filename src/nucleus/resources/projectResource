// src/nucleus/resources/projectResource.ts

/**
 * Project Resource (v1)
 *
 * Purpose:
 *   Define the canonical shape, invariants, validation rules,
 *   and dependency rules for Projects.
 *
 * Projects belong to Organizations.
 */

import {
  registerResource,
  ResourceDefinition,
  ResourceValidationResult,
} from "./resourceRegistry";

export interface ProjectV1 {
  id: string;
  organizationId: string; // must reference a valid organization
  name: string;
  createdAt: number;
  metadata?: Record<string, any>;
}

/**
 * Invariant:
 *   - id must exist
 *   - organizationId must exist
 *   - name must be non-empty
 *   - createdAt must be a valid timestamp
 */
function invariant(resource: ProjectV1): boolean {
  if (!resource) return false;
  if (!resource.id) return false;
  if (!resource.organizationId) return false;
  if (!resource.name || typeof resource.name !== "string") return false;
  if (typeof resource.createdAt !== "number") return false;
  return true;
}

/**
 * Validation:
 *   - name length constraints
 *   - metadata must be an object if present
 */
function validate(resource: ProjectV1): ResourceValidationResult {
  const errors: string[] = [];

  if (resource.name.length < 2) {
    errors.push("Project name must be at least 2 characters.");
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
 *   Project depends on Organization.
 */
const dependencies: ResourceDefinition["dependencies"] = ["organization"];

/**
 * Resource Definition
 */
const ProjectResourceV1: ResourceDefinition = {
  type: "project",
  version: "v1",
  invariant,
  validate,
  dependencies,
};

/**
 * Register the resource with Nucleus.
 */
registerResource(ProjectResourceV1);

export { ProjectResourceV1 };
