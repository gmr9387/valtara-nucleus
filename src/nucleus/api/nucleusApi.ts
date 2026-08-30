// src/nucleus/api/nucleusApi.ts
// Full file swap — Nucleus API with Telemetry + Tracing

import { NucleusDBBridge } from "../db/nucleusDbBridge";
import { NucleusTelemetryAdapter } from "../telemetry/nucleusTelemetryAdapter";

export class NucleusApi {
  private db = new NucleusDBBridge();
  private lineageChain: any[] = [];
  private telemetry: NucleusTelemetryAdapter;

  constructor(private subsystem: string, private organizationId: string) {
    this.telemetry = new NucleusTelemetryAdapter(organizationId, subsystem);
  }

  async emit(name: string, version: string, payload: any) {
    const span = this.telemetry.startSpan(`emit:${name}`);

    const table = this.mapTable(name);

    try {
      await this.db.insertContract(table, this.organizationId, version, payload);

      await this.db.insertEvent(
        this.organizationId,
        this.subsystem,
        name,
        version,
        payload
      );

      this.lineageChain.push({
        subsystem: this.subsystem,
        name,
        version,
        payload,
        at: Date.now(),
      });

      await this.telemetry.info(`Contract emitted: ${name}`, {
        version,
        subsystem: this.subsystem,
      });
    } catch (err) {
      await this.telemetry.error(`Emit failed: ${name}`, { error: err });
      throw err;
    } finally {
      this.telemetry.endSpan(span.spanId);
    }
  }

  async finalize() {
    const span = this.telemetry.startSpan("finalize");

    try {
      await this.db.insertLineage(this.organizationId, this.lineageChain, true);

      await this.telemetry.info("Lineage finalized", {
        chainLength: this.lineageChain.length,
      });

      return { ok: true, chain: this.lineageChain };
    } catch (err) {
      await this.telemetry.error("Finalization failed", { error: err });
      throw err;
    } finally {
      this.telemetry.endSpan(span.spanId);
    }
  }

  lineage() {
    return { chain: this.lineageChain };
  }

  private mapTable(name: string): string {
    switch (name) {
      case "opportunity":
        return "opportunity";
      case "recommendation":
        return "recommendation";
      case "authorization":
        return "authorization_contract";
      case "execution":
        return "execution";
      case "payment":
        return "payment";
      default:
        throw new Error(`Unknown contract name: ${name}`);
    }
  }
}
