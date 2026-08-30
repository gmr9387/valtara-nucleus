// src/nucleus/telemetry/nucleusTelemetry.ts
// Full file swap — Nucleus Telemetry Engine

import { NucleusDBBridge } from "../db/nucleusDbBridge";

export type TelemetryLevel = "info" | "warn" | "error" | "debug";

export class NucleusTelemetry {
  private db = new NucleusDBBridge();

  async emit(
    organizationId: string,
    subsystem: string,
    level: TelemetryLevel,
    message: string,
    metadata: any = null
  ) {
    await this.db.insertTelemetry(
      organizationId,
      subsystem,
      level,
      message,
      metadata
    );
  }
}
