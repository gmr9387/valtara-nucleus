// Phase 36 — Subsystem Bundle

import { subsystemDeploymentMap } from "../deployment/subsystemDeploymentMap";

export interface SubsystemBundle {
  subsystem: string;
  capabilities: string[];
  contracts: string[];
  resources: string[];
}

export function createSubsystemBundle(subsystem: string): SubsystemBundle {
  const entry = subsystemDeploymentMap.find((s) => s.subsystem === subsystem);

  if (!entry) {
    throw new Error(`Unknown subsystem: ${subsystem}`);
  }

  return {
    subsystem: entry.subsystem,
    capabilities: entry.capabilities,
    contracts: entry.contracts,
    resources: entry.resources,
  };
}
