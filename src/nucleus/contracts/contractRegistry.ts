// Phase 26 — Contract Registry (Constitutional)

import { ContractDefinition } from "./contractDefinition";

export interface ContractValidationResult {
  valid: boolean;
  errors?: string[];
}

const registry = new Map<string, ContractDefinition>();

export function registerContract(def: ContractDefinition) {
  const key = `${def.name}@${def.version}`;
  registry.set(key, def);
}

export function getContract(name: string, version: string): ContractDefinition | undefined {
  const key = `${name}@${version}`;
  return registry.get(key);
}

export function validateContract(
  name: string,
  version: string,
  payload: unknown,
  subsystem: string,
  capability: string
): ContractValidationResult {
  const def = getContract(name, version);

  if (!def) {
    return { valid: false, errors: [`Unknown contract: ${name}@${version}`] };
  }

  const errors: string[] = [];

  // Subsystem binding
  if (def.subsystem !== subsystem) {
    errors.push(`Subsystem mismatch: expected ${def.subsystem}, got ${subsystem}`);
  }

  // Capability binding
  if (def.capability !== capability) {
    errors.push(`Capability mismatch: expected ${def.capability}, got ${capability}`);
  }

  // Payload validation
  if (def.validatePayload && !def.validatePayload(payload)) {
    errors.push(`Payload validation failed for ${name}@${version}`);
  }

  return {
    valid: errors.length === 0,
    errors: errors.length ? errors : undefined,
  };
}
