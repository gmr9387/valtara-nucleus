// src/nucleus/constitution.ts
// Full file — The Nucleus Constitution (Unified Runtime Object)

import { NucleusApi } from "./api/nucleusApi";
import { NucleusSubsystemRouter } from "./subsystems/nucleusSubsystemRouter";
import { DecisionEngine } from "./decision/engine";
import { IdentityService } from "./identity/identityService";
import { NucleusRuntime } from "./ops/nucleusRuntime";
import { startWorkflow } from "../lib/workflows/runtime";

export class Nucleus {
  private identity: IdentityService;
  private router: NucleusSubsystemRouter;
  private decision: DecisionEngine;
  private runtime: NucleusRuntime;

  constructor(
    organizationId: string,
    subsystem: string,
    identityContext: {
      actor?: string;
      roles?: string[];
    } = {}
  ) {
    this.identity = new IdentityService({
      organizationId,
      subsystem,
      actor: identityContext.actor,
      roles: identityContext.roles,
    });

    this.router = new NucleusSubsystemRouter(organizationId);
    this.decision = new DecisionEngine(organizationId, subsystem);
    this.runtime = new NucleusRuntime(subsystem, organizationId);
  }

  // -----------------------------
  // Workflow Execution
  // -----------------------------
  async runWorkflow(definition: any) {
    return await startWorkflow(definition, this.identity.getOrganizationId());
  }

  // -----------------------------
  // Subsystem Dispatch
  // -----------------------------
  async dispatch(type: string, version: string, payload: any) {
    return await this.router.dispatch(type, version, payload);
  }

  // -----------------------------
  // Contract Emit (Direct)
  // -----------------------------
  async emit(name: string, version: string, payload: any) {
    const api = new NucleusApi(
      this.identity.getSubsystem(),
      this.identity.getOrganizationId()
    );
    await api.emit(name, version, payload);
    return api.lineage();
  }

  // -----------------------------
  // Decision Engine
  // -----------------------------
  evaluate(context: any) {
    return this.decision.evaluate(context);
  }

  // -----------------------------
  // Background Runtime
  // -----------------------------
  startRuntime() {
    this.runtime.start();
  }

  enqueue(type: string, version: string, payload: any) {
    this.runtime.enqueue(type, version, payload);
  }

  // -----------------------------
  // Identity Access
  // -----------------------------
  getIdentity() {
    return {
      actor: this.identity.getActor(),
      roles: this.identity.getRoles(),
      subsystem: this.identity.getSubsystem(),
      organizationId: this.identity.getOrganizationId(),
    };
  }
}
