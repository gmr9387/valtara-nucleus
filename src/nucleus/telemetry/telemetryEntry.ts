// Phase 22 — Telemetry Entry

import { NucleusIdentity } from "../identity/nucleusIdentity";

export interface TelemetryEntry {
  id: string;

  subsystem: string;
  capability: string;

  eventType: string;
  eventVersion: string;

  latencyMs?: number;
  error?: string;

  identity: NucleusIdentity;

  timestamp: string;
}
