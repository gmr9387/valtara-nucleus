// Phase 19 — Minimal contract registry with validation hook

export interface ContractDefinition {
  name: string;
  version: string;
  capability: string;
  subsystem: "weaver" | "guardian" | "glue" | "dualpay";
  resources: string[];
}

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

export function validateContract(name: string, version: string, _payload: unknown): ContractValidationResult {
  const def = getContract(name, version);
  if (!def) {
    return { valid: false, errors: [`Unknown contract: ${name}@${version}`] };
  }
  // Payload‑level validation can be added later.
  return { valid: true };
}
