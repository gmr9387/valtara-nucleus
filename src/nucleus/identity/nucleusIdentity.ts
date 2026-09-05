// Phase 19 — Identity Spine Implementation

export type NucleusSubsystem = "weaver" | "guardian" | "glue" | "dualpay";

export interface NucleusIdentity {
  tenantId: string;
  environmentId: string; // "dev" | "stage" | "prod" in practice
  projectId: string;
  actorId?: string;

  subsystem: NucleusSubsystem;
  capability: string; // e.g. "discover", "authorize", "bind", "charge"
}
