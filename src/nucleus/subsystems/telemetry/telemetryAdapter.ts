// src/nucleus/subsystems/telemetry/telemetryAdapter.ts

import { TelemetryRuntime } from "./telemetryRuntime";

export class TelemetryAdapter {
  static send(subsystem: string, payload: any) {
    return TelemetryRuntime.emit(subsystem, payload);
  }
}
