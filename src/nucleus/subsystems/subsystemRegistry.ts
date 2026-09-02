// valtaris-nucleus/src/nucleus/subsystems/subsystemRegistry.ts

export type SubsystemId =
  | "contracts"
  | "guardian"
  | "glue"
  | "weaver"
  | "dualpay";

export interface SubsystemDefinition {
  id: SubsystemId;
  label: string;
  enabled: boolean;
  runtime: any; // unified runtime surface
}

const registry = new Map<SubsystemId, SubsystemDefinition>();

/**
 * Register a subsystem into the authoritative Nucleus registry.
 */
export function registerSubsystem(def: SubsystemDefinition) {
  registry.set(def.id, def);
}

/**
 * Retrieve a subsystem definition by ID.
 */
export function getSubsystem(id: SubsystemId): SubsystemDefinition | undefined {
  return registry.get(id);
}

/**
 * List all registered subsystems.
 */
export function listSubsystems(): SubsystemDefinition[] {
  return [...registry.values()];
}
