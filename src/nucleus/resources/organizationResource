// src/nucleus/resources/organizationResource.ts

/**
 * Organization Resource (v1)
 *
 * Purpose:
 *   Define the canonical shape, invariants, validation rules,
 *   and dependency rules for the root tenant resource: Organization.
 *
 * This is the ROOT of the control plane hierarchy.
 */

import {
  registerResource,
  ResourceDefinition,
  ResourceValidationResult,
} from "./resourceRegistry";

export interface OrganizationV1 {
  id: string;
  name: string;
  createdAt: number;
  ownerUserId: string; // root owner of the org
  metadata?: Record<string, any>;
}

/**
 * Invariant:
 *   - id must exist
 *   - name must be non-empty
 *   - createdAt must be a valid timestamp
 *   - ownerUserId must exist
 */
function invariant(resource: OrganizationV1): boolean {
  if (!resource) return false;
  if (!resource.id) return false;
  if (!resource.name || typeof resource.name !== "string") return false;
  if (typeof resource.createdAt !== "number") return false;
  if (!resource.ownerUserId || typeof resource.ownerUserId !== "string") return false;
  return true;
}

/**
 * Validation:
 *   - name length constraints
 *   - metadata must be an object if present
 */
function validate(resource: OrganizationV1): ResourceValidationResult {
  const errors: string[] = [];

  if (resource.name.length < 2) {
    errors.push("Organization name must be at least 2 characters.");
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
 *   Organization has NO dependencies.
 *   It is the root of the resource graph.
 */
const dependencies: [] = [];

/**
 * Resource Definition
 */
const OrganizationResourceV1: ResourceDefinition = {
  type: "organization",
  version: "v1",
  invariant,
  validate,
  dependencies,
};

/**
 * Register the resource with Nucleus.
 */
registerResource(OrganizationResourceV1);

export { OrganizationResourceV1 };
