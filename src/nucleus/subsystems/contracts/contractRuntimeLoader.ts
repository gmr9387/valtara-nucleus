// src/nucleus/subsystems/contracts/contractRuntimeLoader.ts
// Full file — Contract Runtime Loader

import {
  OpportunityRuntime,
  RecommendationRuntime,
  AuthorizationRuntime,
  ExecutionRuntime,
  PaymentRuntime
} from "./index";

import { NucleusTelemetryAdapter } from "../../telemetry/nucleusTelemetryAdapter";

export class ContractRuntimeLoader {
  private telemetry: NucleusTelemetryAdapter;

  constructor(private organizationId: string) {
    this.telemetry = new NucleusTelemetryAdapter(
      organizationId,
      "contract-runtime-loader"
    );
  }

  // -----------------------------
  // Resolve Contract Runtime
  // -----------------------------
  resolve(type: string) {
    const span = this.telemetry.startSpan(`resolve:${type}`);

    try {
      switch (type) {
        case "opportunity":
          return new OpportunityRuntime(this.organizationId);

        case "recommendation":
          return new RecommendationRuntime(this.organizationId);

        case "authorization":
          return new AuthorizationRuntime(this.organizationId);

        case "execution":
          return new ExecutionRuntime(this.organizationId);

        case "payment":
          return new PaymentRuntime(this.organizationId);

        default:
          throw new Error(`Unknown contract type: ${type}`);
      }
    } catch (err) {
      this.telemetry.error("Contract runtime resolution failed", {
        type,
        error: err
      });
      throw err;
    } finally {
      this.telemetry.endSpan(span.spanId);
    }
  }
}
