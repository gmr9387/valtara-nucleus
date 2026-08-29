// src/nucleus/http/httpRouter.ts
// Full file — Nucleus HTTP router (REST endpoints)

import { WorkflowController } from "./workflowController";
import { SubsystemController } from "./subsystemController";
import { LineageController } from "./lineageController";
import { TelemetryController } from "./telemetryController";
import { DecisionController } from "./decisionController";
import { IdentityMiddleware } from "./identityMiddleware";

export class HttpRouter {
  constructor(private app: any) {}

  register() {
    // Identity binding
    this.app.use(IdentityMiddleware.bindIdentity);

    // Workflow execution
    this.app.post("/nucleus/workflow/run", WorkflowController.run);

    // Subsystem dispatch
    this.app.post("/nucleus/subsystem/dispatch", SubsystemController.dispatch);

    // Lineage retrieval
    this.app.get("/nucleus/lineage/:organizationId", LineageController.get);

    // Telemetry retrieval
    this.app.get("/nucleus/telemetry/:organizationId", TelemetryController.get);

    // Decision engine evaluation
    this.app.post("/nucleus/decision/evaluate", DecisionController.evaluate);
  }
}
