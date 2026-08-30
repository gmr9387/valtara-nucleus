// src/nucleus/integrations/nucleusTelemetry.ts

/**
 * Nucleus Telemetry Stream
 *
 * Constitutional role:
 * Nucleus = KNOW
 *
 * This integration emits structured telemetry events for:
 *   - external observability systems
 *   - logging pipelines
 *   - monitoring dashboards
 *
 * Telemetry is read-only.
 * No execution.
 * No authorization.
 * No domain logic.
 */

import { subscribe } from "../events/eventBus";
import { NucleusEvent } from "../contracts/NucleusEvent";
import { getEcosystemState } from "../state/nucleusState";

export function startNucleusTelemetry() {
  // Emit telemetry for every event flowing through the ecosystem
  subscribe("*", (event: NucleusEvent) => {
    const snapshot = getEcosystemState();

    const telemetry = {
      timestamp: Date.now(),
      eventType: event.type,
      source: event.source,
      payloadSummary: summarizePayload(event.payload),
      subsystemHealth: snapshot.subsystemHealth,
      lastEventType: snapshot.lastEvent?.type,
    };

    emitTelemetry(telemetry);
  });

  console.log("[Nucleus] Telemetry Stream Active.");
}

/**
 * summarizePayload
 *
 * Lightweight summarizer to avoid leaking sensitive data.
 */
function summarizePayload(payload: any) {
  if (!payload) return null;

  if (typeof payload === "string") {
    return payload.slice(0, 120);
  }

  if (typeof payload === "object") {
    return Object.keys(payload).slice(0, 10);
  }

  return typeof payload;
}

/**
 * emitTelemetry
 *
 * Placeholder emitter.
 * Replace with:
 *   - console.log
 *   - Bun.write
 *   - Supabase logs
 *   - OpenTelemetry exporter
 *   - Datadog / Grafana agent
 */
function emitTelemetry(data: any) {
  console.log("[Telemetry]", JSON.stringify(data));
}
