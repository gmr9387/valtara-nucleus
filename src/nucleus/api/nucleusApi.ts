// src/nucleus/api/nucleusApi.ts
// Full file — Updated with Contract Router Binding

import { bindContractSubsystemRoutes } from "../subsystems/contracts/contractRouterBinding";
import { NucleusTelemetryAdapter } from "../telemetry/nucleusTelemetryAdapter";

export class NucleusApi {
  private telemetry: NucleusTelemetryAdapter;

  constructor(private app: any, private organizationId: string) {
    this.telemetry = new NucleusTelemetryAdapter(
      organizationId,
      "nucleus-api"
    );

    this.bindRoutes();
  }

  // -----------------------------
  // Bind All API Routes
  // -----------------------------
  private bindRoutes() {
    // Existing subsystem bindings would be here if present
    // (weaver, guardian, glue, dualpay)

    // -----------------------------
    // NEW: Contract Subsystem Binding
    // -----------------------------
    bindContractSubsystemRoutes(this.app, this.organizationId);
  }
}
