// Phase 36 — Runtime Bundle

import { deploymentManifest } from "../deployment/deploymentManifest";

export interface RuntimeBundle {
  version: string;
  subsystems: string[];
  capabilities: string[];
  contracts: string[];
  resources: string[];
}

export function createRuntimeBundle(): RuntimeBundle {
  return {
    version: deploymentManifest.version,
    subsystems: deploymentManifest.subsystems,
    capabilities: deploymentManifest.capabilities,
    contracts: deploymentManifest.contracts,
    resources: deploymentManifest.resources,
  };
}
