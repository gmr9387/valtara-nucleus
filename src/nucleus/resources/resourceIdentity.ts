// Phase 20 — Resource Identity

import { NucleusIdentity } from "../identity/nucleusIdentity";

export interface ResourceIdentity {
  tenantId: string;
  environmentId: string;
  projectId: string;

  subsystem: string;
  capability: string;

  actorId?: string;
}
