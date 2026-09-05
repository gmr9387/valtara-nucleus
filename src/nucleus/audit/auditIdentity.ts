// Phase 33 — Audit Identity

import { NucleusIdentity } from "../identity/nucleusIdentity";

export const auditIdentity: NucleusIdentity = {
  tenantId: "tenant-audit",
  environmentId: "dev",
  projectId: "audit-project",
  subsystem: "weaver",
  capability: "discover",
  actorId: "auditor",
};
