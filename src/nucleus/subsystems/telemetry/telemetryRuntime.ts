// src/nucleus/subsystems/telemetry/telemetryRuntime.ts

import { eventBus } from "../../events/eventBus";
import { TelemetryEngine } from "./telemetryEngine";

export class TelemetryRuntime {
  static emit(subsystem: string, payload: any) {
    const event = TelemetryEngine.format(subsystem, payload);
    eventBus.emit(`telemetry.${subsystem}`, event);
    return event;
  }
}
