// Phase 32 — Orchestration Identity

import { NucleusIdentity } from "../identity/nucleusIdentity";

export const orchestrationIdentity: NucleusIdentity = {
  tenantId: "tenant-orchestration",
  environmentId: "dev",
  projectId: "orchestration-project",
  subsystem: "weaver",
  capability: "discover",
  actorId: "orchestrator",
};
