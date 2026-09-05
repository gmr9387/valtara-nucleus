// Phase 41 — Runtime Activation Proof

import { environmentActivationEngine } from "../activationEnv/environmentActivationEngine";
import { constitution } from "../constitution/constitution";

export interface ActivationProof {
  environmentsActivated: boolean;
  constitutionVersion: string;
  timestamp: string;
}

export function generateActivationProof(): ActivationProof {
  const envs = environmentActivationEngine.activateAll();

  return {
    environmentsActivated: envs.every((e) => e.healthy),
    constitutionVersion: constitution.version,
    timestamp: new Date().toISOString(),
  };
}
