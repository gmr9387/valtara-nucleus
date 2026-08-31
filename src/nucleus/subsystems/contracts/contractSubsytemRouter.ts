// src/nucleus/subsystems/contracts/contractSubsystemRouter.ts
// Full file — Contract Subsystem HTTP Router

import { ContractSubsystemController } from "./contractSubsystemController";
import { NucleusTelemetryAdapter } from "../../telemetry/nucleusTelemetryAdapter";

export class ContractSubsystemRouter {
  private telemetry: NucleusTelemetryAdapter;
  private controller: ContractSubsystemController;

  constructor(private organizationId: string) {
    this.telemetry = new NucleusTelemetryAdapter(
      organizationId,
      "contract-router"
    );

    this.controller = new ContractSubsystemController(organizationId);
  }

  // -----------------------------
  // HTTP Dispatch Entry Point
  // -----------------------------
  async handleRequest(req: any) {
    const { type, version } = req.params;
    const payload = req.body;

    const span = this.telemetry.startSpan(`contract:http:${type}`);

    try {
      const result = await this.controller.execute(type, version, payload);

      await this.telemetry.info("Contract HTTP dispatch completed", {
        type,
        version,
      });

      return {
        status: 200,
        data: result,
      };
    } catch (err) {
      await this.telemetry.error("Contract HTTP dispatch failed", {
        type,
        version,
        error: err,
      });

      return {
        status: 500,
        error: err.message || "Contract dispatch failed",
      };
    } finally {
      this.telemetry.endSpan(span.spanId);
    }
  }
}
