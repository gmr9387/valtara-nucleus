// src/nucleus/subsystems/nucleusSubsystemRouter.ts
// Corrected Full File — Unified Nucleus Subsystem Router

import { NucleusApi } from "../api/nucleusApi";
import { NucleusTelemetryAdapter } from "../telemetry/nucleusTelemetryAdapter";

export class NucleusSubsystemRouter {
  private telemetry: NucleusTelemetryAdapter;

  constructor(private organizationId: string) {
    this.telemetry = new NucleusTelemetryAdapter(
      organizationId,
      "subsystem-router"
    );
  }

  // -----------------------------
  // Main Dispatch Entry Point
  // -----------------------------
  async dispatch(type: string, version: string, payload: any) {
    const span = this.telemetry.startSpan(`dispatch:${type}`);

    try {
      const subsystem = this.mapSubsystem(type);

      const api = new NucleusApi(subsystem, this.organizationId);

      await api.emit(type, version, payload);
      const result = await api.finalize();

      await this.telemetry.info("Subsystem dispatch completed", {
        type,
        version,
        subsystem,
      });

      return result;
    } catch (err) {
      await this.telemetry.error("Subsystem dispatch failed", {
        type,
        version,
        error: err,
      });
      throw err;
    } finally {
      this.telemetry.endSpan(span.spanId);
    }
  }

  // -----------------------------
  // Contract Type → Subsystem Mapping
  // -----------------------------
  private mapSubsystem(type: string): string {
    switch (type) {
      case "opportunity":
        return "opportunity";

      case "recommendation":
        return "recommendation";

      case "authorization":
        return "authorization";

      case "execution":
        return "execution";

      case "payment":
        return "payment";

      default:
        return "core";
    }
  }
}
