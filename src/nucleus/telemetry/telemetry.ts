// src/nucleus/telemetry/telemetry.ts

/**
 * Telemetry (Phase 14 — T1)
 *
 * Pure eventBus telemetry.
 * No console logs.
 * No sinks.
 * No managers.
 */

import { eventBus } from "../events/eventBus";

export type TelemetrySignal = {
  subsystem: string;
  contract: string;
  claimId: string;
  organizationId: string;
  timestamp: number;
  payload: Record<string, any>;
};

export function recordTelemetry(
  subsystem: string,
  contract: string,
  claimId: string,
  organizationId: string,
  payload: Record<string, any>
) {
  const signal: TelemetrySignal = {
    subsystem,
    contract,
    claimId,
    organizationId,
    timestamp: Date.now(),
    payload,
  };

  eventBus.emit(`telemetry.${subsystem}.${contract}`, signal);
  return signal;
}
