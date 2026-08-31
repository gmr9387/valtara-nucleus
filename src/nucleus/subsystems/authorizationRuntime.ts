// src/nucleus/subsystems/authorizationRuntime.ts
// Full file — Authorization Subsystem Runtime

import { NucleusApi } from "../api/nucleusApi";
import { NucleusTelemetryAdapter } from "../telemetry/nucleusTelemetryAdapter";

export class AuthorizationRuntime {
  private telemetry: NucleusTelemetryAdapter;
  private api: NucleusApi;

  constructor(private organizationId: string) {
    this.telemetry = new NucleusTelemetryAdapter(
      organizationId,
      "authorization"
    );
    this.api = new NucleusApi("authorization", organizationId);
  }

  async run(version: string, payload: any) {
    const span = this.telemetry.startSpan("authorization:run");

    try {
      await this.api.emit("authorization", version, payload);
      const result = await this.api.finalize();

      await this.telemetry.info("Authorization processed", {
        version,
        payload,
      });

      return result;
    } catch (err) {
      await this.telemetry.error("Authorization runtime failed", {
        error: err,
      });
      throw err;
    } finally {
      this.telemetry.endSpan(span.spanId);
    }
  }
}
