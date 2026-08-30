// src/nucleus/integrations/integrationLoader.ts
// Constitutional Integration Loader

export interface IntegrationDefinition {
  name: string;
  clientFactory: (organizationId: string) => any;
}

const registry = new Map<string, IntegrationDefinition>();

export function registerIntegration(def: IntegrationDefinition) {
  registry.set(def.name, def);
}

export function getIntegration(name: string): IntegrationDefinition | undefined {
  return registry.get(name);
}

export function listIntegrations(): IntegrationDefinition[] {
  return [...registry.values()];
}
