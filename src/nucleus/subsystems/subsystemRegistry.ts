// Authoritative Constitutional Subsystem Registry

import { registerCapability } from "../capabilityRegistry";

export interface SubsystemDefinition {
  name: string;
  capabilities: string[];
  runtime: any;
}

const registry = new Map<string, SubsystemDefinition>();

export function registerSubsystem(def: SubsystemDefinition) {
  registry.set(def.name, def);

  for (const capability of def.capabilities) {
    registerCapability(def.name, capability as any);
  }
}

export function getSubsystem(name: string): SubsystemDefinition | undefined {
  return registry.get(name);
}

export function listSubsystems(): SubsystemDefinition[] {
  return [...registry.values()];
}
