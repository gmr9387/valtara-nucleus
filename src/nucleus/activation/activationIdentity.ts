// Phase 28 — Activation Identity (default identity for first boot)

import { NucleusIdentity } from "../identity/nucleusIdentity";

export const activationIdentity: NucleusIdentity = {
  tenantId: "tenant-activation",
  environmentId: "dev",
  projectId: "activation-project",
  subsystem: "weaver",
  capability: "discover",
  actorId: "activation-actor",
};
