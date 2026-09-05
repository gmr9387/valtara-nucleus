// Phase 6.3 — SubsystemIdentityAdapter
// Normalizes subsystem identity → NucleusIdentity

import { NucleusIdentity } from "../identity/nucleusIdentity";

export interface RawSubsystemIdentity {
  tenantId: string;
  projectId?: string;
  environmentId?: string;
  actorId?: string;
  subsystemContext?: unknown;
}

export class SubsystemIdentityAdapter {
  static normalize(raw: RawSubsystemIdentity): NucleusIdentity {
    return {
      tenantId: raw.tenantId,
      projectId: raw.projectId,
      environmentId: raw.environmentId,
      actorId: raw.actorId,
    };
  }
}
