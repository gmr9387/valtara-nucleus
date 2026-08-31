// src/nucleus/subsystems/contracts/contractSubsystemHealth.ts
// Full file — Contract Subsystem Health Check

import { ContractRuntimeLoader } from "./contractRuntimeLoader";
import { NucleusTelemetryAdapter } from "../../telemetry/nucleusTelemetryAdapter";

export class ContractSubsystemHealth {
  private telemetry: NucleusTelemetryAdapter;
  private loader: ContractRuntimeLoader;

  constructor(private organizationId: string) {
    this.telemetry = new NucleusTelemetryAdapter(
      organizationId,
      "contract-health"
    );

    this.loader = new ContractRuntimeLoader(organizationId);
  }

  // -----------------------------
  // Health Check for All Contract Runtimes
  // -----------------------------
  async check() {
    const span = this.telemetry.startSpan("contract:health");

    try {
      const runtimes = [
        "opportunity",
        "recommendation",
        "authorization",
        "execution",
        "payment",
      ];

      const results: Record<string, any> = {};

      for (const type of runtimes) {
        try {
          const runtime = this.loader.resolve(type);

          // Each runtime must expose a health() method
          const health = await runtime.health();

          results[type] = {
            status: "healthy",
            details: health,
          };
        } catch (err) {
          results[type] = {
            status: "unhealthy",
            error: err.message || String(err),
          };
        }
      }

      await this.telemetry.info("Contract subsystem health check completed", {
        results,
      });

      return results;
    } catch (err) {
      await this.telemetry.error("Contract subsystem health check failed", {
        error: err,
      });
      throw err;
    } finally {
      this.telemetry.endSpan(span.spanId);
    }
  }
}
