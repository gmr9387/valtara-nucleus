// Phase 21 — Lineage Entry

import { NucleusIdentity } from "../identity/nucleusIdentity";

export interface LineageEntry {
  id: string;

  eventType: string;
  eventVersion: string;
  payload: unknown;

  identity: NucleusIdentity;

  resourceId?: string;
  resourceType?: string;

  timestamp: string;
}
