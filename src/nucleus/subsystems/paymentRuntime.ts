// src/nucleus/subsystems/paymentRuntime.ts
// Full file — Payment Subsystem Runtime

import { NucleusApi } from "../api/nucleusApi";
import { NucleusTelemetryAdapter } from "../telemetry/nucleusTelemetryAdapter";

export class PaymentRuntime {
  private telemetry: NucleusTelemetryAdapter;
  private api: NucleusApi;

  constructor(private organizationId: string) {
    this.telemetry = new NucleusTelemetryAdapter(
      organizationId,
      "payment"
    );
    this.api = new NucleusApi("payment", organizationId);
  }

  async run(version: string, payload: any) {
    const span = this.telemetry.startSpan("payment:run");

    try {
      await this.api.emit("payment", version, payload);
      const result = await this.api.finalize();

      await this.telemetry.info("Payment processed", {
        version,
        payload,
      });

      return result;
    } catch (err) {
      await this.telemetry.error("Payment runtime failed", {
        error: err,
      });
      throw err;
    } finally {
      this.telemetry.endSpan(span.spanId);
    }
  }
}
