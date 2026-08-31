// src/nucleus/subsystems/nucleusSubsystemRouter.ts
// Full file — Contract-Aware Subsystem Router

import { ContractRuntimeLoader } from "./contracts/contractRuntimeLoader";
import { NucleusTelemetryAdapter } from "../telemetry/nucleusTelemetryAdapter";

export class NucleusSubsystemRouter {
  private telemetry: NucleusTelemetryAdapter;
  private loader: ContractRuntimeLoader;

  constructor(private organizationId: string) {
    this.telemetry = new NucleusTelemetryAdapter(
      organizationId,
      "subsystem-router"
    );

    this.loader = new ContractRuntimeLoader(organizationId);
  }

  // -----------------------------
  // Main Dispatch Entry Point
  // -----------------------------
  async dispatch(type: string, version: string, payload: any) {
    const span = this.telemetry.startSpan(`dispatch:${type}`);

    try {
      // Resolve correct contract runtime
      const runtime = this.loader.resolve(type);

      // Execute contract runtime
      const result = await runtime.run(version, payload);

      await this.telemetry.info("Contract dispatch completed", {
        type,
        version,
      });

      return result;
    } catch (err) {
      await this.telemetry.error("Contract dispatch failed", {
        type,
        version,
        error: err,
      });
      throw err;
    } finally {
      this.telemetry.endSpan(span.spanId);
    }
  }
}
