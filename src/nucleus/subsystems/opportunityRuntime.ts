// src/nucleus/subsystems/opportunityRuntime.ts
// Full file — Opportunity Subsystem Runtime

import { NucleusApi } from "../api/nucleusApi";
import { NucleusTelemetryAdapter } from "../telemetry/nucleusTelemetryAdapter";

export class OpportunityRuntime {
  private telemetry: NucleusTelemetryAdapter;
  private api: NucleusApi;

  constructor(private organizationId: string) {
    this.telemetry = new NucleusTelemetryAdapter(
      organizationId,
      "opportunity"
    );
    this.api = new NucleusApi("opportunity", organizationId);
  }

  async run(version: string, payload: any) {
    const span = this.telemetry.startSpan("opportunity:run");

    try {
      await this.api.emit("opportunity", version, payload);
      const result = await this.api.finalize();

      await this.telemetry.info("Opportunity processed", {
        version,
        payload,
      });

      return result;
    } catch (err) {
      await this.telemetry.error("Opportunity runtime failed", { error: err });
      throw err;
    } finally {
      this.telemetry.endSpan(span.spanId);
    }
  }
}
