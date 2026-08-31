// src/nucleus/subsystems/recommendationRuntime.ts
// Full file — Recommendation Subsystem Runtime

import { NucleusApi } from "../api/nucleusApi";
import { NucleusTelemetryAdapter } from "../telemetry/nucleusTelemetryAdapter";

export class RecommendationRuntime {
  private telemetry: NucleusTelemetryAdapter;
  private api: NucleusApi;

  constructor(private organizationId: string) {
    this.telemetry = new NucleusTelemetryAdapter(
      organizationId,
      "recommendation"
    );
    this.api = new NucleusApi("recommendation", organizationId);
  }

  async run(version: string, payload: any) {
    const span = this.telemetry.startSpan("recommendation:run");

    try {
      await this.api.emit("recommendation", version, payload);
      const result = await this.api.finalize();

      await this.telemetry.info("Recommendation processed", {
        version,
        payload,
      });

      return result;
    } catch (err) {
      await this.telemetry.error("Recommendation runtime failed", {
        error: err,
      });
      throw err;
    } finally {
      this.telemetry.endSpan(span.spanId);
    }
  }
}
