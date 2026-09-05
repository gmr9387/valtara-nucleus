// Phase 22 — Telemetry Engine

import { NucleusEvent } from "../events/nucleusEvent";
import { telemetryStore } from "./telemetryStore";
import { TelemetryEntry } from "./telemetryEntry";

export class TelemetryEngine {
  recordEvent(event: NucleusEvent, latencyMs?: number, error?: string) {
    const entry: TelemetryEntry = {
      id: crypto.randomUUID(),

      subsystem: event.context.subsystem,
      capability: event.context.capability,

      eventType: event.type,
      eventVersion: event.version,

      latencyMs,
      error,

      identity: event.context,

      timestamp: new Date().toISOString(),
    };

    telemetryStore.record(entry);
  }
}

export const telemetryEngine = new TelemetryEngine();
