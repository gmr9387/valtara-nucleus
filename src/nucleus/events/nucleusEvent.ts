// Phase 19 — NucleusEvent with full identity spine

import { NucleusIdentity } from "../identity/nucleusIdentity";

export interface NucleusEvent {
  type: string;
  version: string;
  payload: unknown;

  source: string; // subsystem or external source
  context: NucleusIdentity;

  timestamp: string;
  correlationId?: string;
  traceId?: string;

  simulated?: boolean;
}
