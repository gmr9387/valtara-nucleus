// src/nucleus/runtime/nucleusRuntime.ts

import { RuntimeRouter } from "./runtimeRouter";
import { RuntimeContext, Subsystem } from "./runtimeGuards";
import { ResourceService } from "../resources/resourceService";

/**
 * NucleusRuntime
 *
 * Holds runtime context and delegates dispatch to RuntimeRouter.
 */
export class NucleusRuntime {
  private ctx: RuntimeContext;
  private router: RuntimeRouter;

  constructor(subsystem: Subsystem, organizationId: string) {
    const resources = new ResourceService(organizationId);

    this.ctx = {
      subsystem,
      organizationId,
      resources,
    };

    this.router = new RuntimeRouter(this.ctx);
  }

  boot() {
    // Runtime boot hook; can be extended for telemetry, etc.
    console.log(
      `[NucleusRuntime] Booted for subsystem=${this.ctx.subsystem}, org=${this.ctx.organizationId}`
    );
  }

  dispatch(contractName: string, version: string, payload: any) {
    return this.router.dispatch(contractName, version, payload);
  }

  get context(): RuntimeContext {
    return this.ctx;
  }
}
