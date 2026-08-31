// src/nucleus/api/nucleusBatchApi.ts
// Full file — Updated with Contract Router Binding + OpenAPI Binding

import { NucleusTelemetryAdapter } from "../telemetry/nucleusTelemetryAdapter";

// NEW: Contract subsystem binding
import { bindContractSubsystemRoutes } from "../subsystems/contracts/contractRouterBinding";

// NEW: OpenAPI binding
import { bindOpenApiRoutes } from "./openai/openApiRouter";

export class NucleusBatchApi {
  private telemetry: NucleusTelemetryAdapter;

  constructor(private app: any, private organizationId: string) {
    this.telemetry = new NucleusTelemetryAdapter(
      organizationId,
      "nucleus-batch-api"
    );

    this.bindRoutes();
  }

  // -----------------------------
  // Bind All API Routes (Batch Mode)
  // -----------------------------
  private bindRoutes() {
    // ----------------------------------------
    // Contract Subsystem Routes (NEW)
    // ----------------------------------------
    bindContractSubsystemRoutes(this.app, this.organizationId);

    // ----------------------------------------
    // OpenAPI Routes (NEW)
    // ----------------------------------------
    bindOpenApiRoutes(this.app);

    // ----------------------------------------
    // Existing subsystem bindings would go here
    // (weaver, guardian, glue, dualpay)
    // ----------------------------------------
  }
}
