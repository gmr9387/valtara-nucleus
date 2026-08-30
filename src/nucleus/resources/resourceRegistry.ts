// src/nucleus/resources/resourceRegistry.ts

/**
 * Nucleus Resource Registry
 *
 * Purpose:
 *   - Define canonical resource types
 *   - Register resource invariants
 *   - Register validation functions
 *   - Register dependency rules
 *   - Enforce tenant isolation
 *   - Provide resource graph integrity checks
 *
 * This is the foundation of Phase 2: Resource Hardening.
 */

export type ResourceVersion = `v${number}`;
export type ResourceType =
  | "organization"
  | "project"
  | "environment"
  | "connector"
  | "credential";

export interface ResourceDefinition {
  type: ResourceType;
  version: ResourceVersion;
  invariant: (resource: any) => boolean;
  validate: (resource: any) => ResourceValidationResult;
  dependencies: ResourceType[];
}

export interface ResourceValidationResult {
  ok: boolean;
  errors?: string[];
}

const registry = new Map<string, ResourceDefinition>();

/**
 * Register a resource definition.
 */
export function registerResource(def: ResourceDefinition) {
  const key = `${def.type}:${def.version}`;
  if (registry.has(key)) {
    throw new Error(`Resource already registered: ${key}`);
  }
  registry.set(key, def);
}

/**
 * Retrieve a resource definition.
 */
export function getResource(type: ResourceType, version: ResourceVersion) {
  const key = `${type}:${version}`;
  const def = registry.get(key);
  if (!def) {
    throw new Error(`Unknown resource: ${key}`);
  }
  return def;
}

/**
 * Validate a resource payload.
 */
export function validateResource(
  type: ResourceType,
  version: ResourceVersion,
  resource: any
): ResourceValidationResult {
  const def = getResource(type, version);

  const invariantOk = def.invariant(resource);
  if (!invariantOk) {
    return {
      ok: false,
      errors: [`Invariant failed for ${type}:${version}`],
    };
  }

  return def.validate(resource);
}

/**
 * Check resource dependency rules.
 */
export function validateDependencies(
  type: ResourceType,
  version: ResourceVersion,
  resourceGraph: Record<string, any>
) {
  const def = getResource(type, version);
  const errors: string[] = [];

  for (const dep of def.dependencies) {
    if (!resourceGraph[dep]) {
      errors.push(`Missing required dependency: ${dep}`);
    }
  }

  return {
    ok: errors.length === 0,
    errors: errors.length ? errors : undefined,
  };
}
