// src/nucleus/subsystems/contracts/contractSubsystemController.ts
// Full file — Contract Subsystem Controller

import { ContractRuntimeLoader } from "./contractRuntimeLoader";
import { NucleusTelemetryAdapter } from "../../telemetry/nucleusTelemetryAdapter";

export class ContractSubsystemController {
  private telemetry: NucleusTelemetryAdapter;
  private loader: ContractRuntimeLoader;

  constructor(private organizationId: string) {
    this.telemetry = new NucleusTelemetryAdapter(
      organizationId,
      "contract-controller"
    );

    this.loader = new ContractRuntimeLoader(organizationId);
  }

  // -----------------------------
  // Execute Contract
  // -----------------------------
  async execute(type: string, version: string, payload: any) {
    const span = this.telemetry.startSpan(`contract:execute:${type}`);

    try {
      const runtime = this.loader.resolve(type);
      const result = await runtime.run(version, payload);

      await this.telemetry.info("Contract executed", {
        type,
        version,
      });

      return result;
    } catch (err) {
      await this.telemetry.error("Contract execution failed", {
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
