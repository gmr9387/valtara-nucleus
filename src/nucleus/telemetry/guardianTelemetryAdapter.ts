// src/nucleus/telemetry/guardianTelemetryAdapter.ts

import { GuardianTelemetryRecord } from "./guardianTelemetrySchema";

export class GuardianTelemetryAdapter {
  constructor(private organizationId: string) {}

  async record(event: GuardianTelemetryRecord) {
    const enriched: GuardianTelemetryRecord = {
      ...event,
      timestamp: new Date().toISOString(),
      subsystem: "guardian",
      organizationId: this.organizationId,
    };

    console.log("[GuardianTelemetry]", JSON.stringify(enriched, null, 2));
    return enriched;
  }
}
