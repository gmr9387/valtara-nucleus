// src/nucleus/ops/nucleusTelemetry.ts

/**
 * NucleusTelemetry (Phase 11.2)
 *
 * Purpose:
 *   Emit lightweight telemetry events for:
 *     - contract emissions
 *     - subsystem activity
 *     - performance samples
 */

export class NucleusTelemetry {
  private events: any[] = [];

  record(event: string, payload: any) {
    this.events.push({
      event,
      payload,
      at: Date.now(),
    });
  }

  stream() {
    return [...this.events];
  }

  clear() {
    this.events = [];
  }
}
