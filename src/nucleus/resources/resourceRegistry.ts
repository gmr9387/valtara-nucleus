// Phase 20 — Resource Registry

import { ResourceState } from "./resourceState";

const registry = new Map<string, ResourceState>();

export function registerResource(resource: ResourceState) {
  registry.set(resource.id, resource);
}

export function getResource(id: string): ResourceState | undefined {
  return registry.get(id);
}

export function listResources(): ResourceState[] {
  return [...registry.values()];
}
