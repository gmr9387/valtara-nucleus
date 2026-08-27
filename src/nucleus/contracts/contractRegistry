// src/nucleus/contracts/contractRegistry.ts

/**
 * Nucleus Contract Registry
 *
 * Purpose:
 *   - Define canonical contract names
 *   - Register contract versions
 *   - Register invariants
 *   - Register validation functions
 *   - Register compatibility rules
 *   - Provide standardized error envelopes
 *
 * This is the foundation of Phase 1: Contract Hardening.
 */

export type ContractVersion = `v${number}`;
export type ContractName =
  | "opportunity"
  | "recommendation"
  | "authorization"
  | "execution"
  | "payment";

export interface ContractDefinition {
  name: ContractName;
  version: ContractVersion;
  validate: (payload: any) => ContractValidationResult;
  invariant: (payload: any) => boolean;
  compatibleWith: ContractVersion[];
}

export interface ContractValidationResult {
  ok: boolean;
  errors?: string[];
}

const registry = new Map<string, ContractDefinition>();

/**
 * Register a contract definition.
 */
export function registerContract(def: ContractDefinition) {
  const key = `${def.name}:${def.version}`;
  if (registry.has(key)) {
    throw new Error(`Contract already registered: ${key}`);
  }
  registry.set(key, def);
}

/**
 * Retrieve a contract definition.
 */
export function getContract(name: ContractName, version: ContractVersion) {
  const key = `${name}:${version}`;
  const def = registry.get(key);
  if (!def) {
    throw new Error(`Unknown contract: ${key}`);
  }
  return def;
}

/**
 * Validate a contract payload.
 */
export function validateContract(
  name: ContractName,
  version: ContractVersion,
  payload: any
): ContractValidationResult {
  const def = getContract(name, version);

  const invariantOk = def.invariant(payload);
  if (!invariantOk) {
    return {
      ok: false,
      errors: [`Invariant failed for ${name}:${version}`],
    };
  }

  return def.validate(payload);
}

/**
 * Standardized error envelope.
 */
export function contractErrorEnvelope(
  name: ContractName,
  version: ContractVersion,
  errors: string[]
) {
  return {
    contract: name,
    version,
    ok: false,
    errors,
    timestamp: Date.now(),
  };
}

/**
 * Check compatibility between versions.
 */
export function isCompatible(
  name: ContractName,
  fromVersion: ContractVersion,
  toVersion: ContractVersion
) {
  const def = getContract(name, fromVersion);
  return def.compatibleWith.includes(toVersion);
}
