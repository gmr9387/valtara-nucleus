// Phase 35 — Deployment Manifest

import { constitution } from "../constitution/constitution";

export interface DeploymentManifest {
  version: string;

  subsystems: string[];
  capabilities: string[];
  contracts: string[];
  resources: string[];

  environments: string[];
}

export const deploymentManifest: DeploymentManifest = {
  version: constitution.version,

  subsystems: constitution.subsystems.map((s) => s.name),

  capabilities: constitution.subsystems.flatMap((s) =>
    s.capabilities.map((c) => `${s.name}.${c}`)
  ),

  contracts: constitution.contracts.map(
    (c) => `${c.name}@${c.version} (${c.subsystem}.${c.capability})`
  ),

  resources: constitution.resources.map(
    (r) => `${r.type} (${r.subsystem}.${r.capability})`
  ),

  environments: ["dev", "staging", "prod"],
};
