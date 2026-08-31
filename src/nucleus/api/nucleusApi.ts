// src/nucleus/api/nucleusApi.ts
// Corrected Full File — Nucleus API with Telemetry + Tracing

import { NucleusDBBridge } from "../db/nucleusDbBridge";
import { NucleusTelemetryAdapter } from "../telemetry/nucleusTelemetryAdapter";

export class NucleusApi {
  private db: NucleusDBBridge;
  private lineageChain: any[] = [];
  private telemetry: NucleusTelemetryAdapter;

  constructor(private subsystem: string, private organizationId: string) {
    this.telemetry = new NucleusTelemetryAdapter(organizationId, subsystem);
    this.db = new NucleusDBBridge(organizationId, subsystem);
  }

  // -----------------------------
  // Contract Emit
  // -----------------------------
  async emit(name: string, version: string, payload: any) {
    const span = this.telemetry.startSpan(`emit:${name}`);

    const table = this.mapTable(name);

    try {
      // Contract write
      await this.db.insertContract(
        table,
        this.organizationId,
        version,
        payload
      );

      // Event write
      await this.db.insertEvent(
        this.organizationId,
        this.subsystem,
        name,
        version,
        payload
      );

      // Local lineage
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

  // -----------------------------
  // Finalize Lineage
  // -----------------------------
  async finalize() {
    const span = this.telemetry.startSpan("finalize");

    try {
      await this.db.insertLineage(
        this.organizationId,
        this.lineageChain,
        true
      );

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

  // -----------------------------
  // Get Local Lineage
  // -----------------------------
  lineage() {
    return { chain: this.lineageChain };
  }

  // -----------------------------
  // Contract Table Mapping
  // -----------------------------
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
