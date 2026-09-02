// src/nucleus/runtime/runtimeRouter.ts

import { RuntimeContext, RuntimeGuards } from "./runtimeGuards";
import { getSubsystem } from "../subsystems/subsystemRegistry";

/**
 * Runtime Router
 * --------------
 * Central dispatcher for subsystem contract emissions.
 * Uses the authoritative subsystem registry.
 */
export class RuntimeRouter {
  constructor(private ctx: RuntimeContext) {}

  dispatch(contractName: string, version: string, payload: any) {
    // 1. Subsystem permission enforcement
    RuntimeGuards.enforceSubsystemPermission(this.ctx, contractName);

    // 2. Contract payload validation
    RuntimeGuards.validateContractPayload(contractName, version, payload);

    // 3. Contract lineage enforcement
    RuntimeGuards.enforceContractLineage(contractName, payload);

    // 4. Resource lineage enforcement
    RuntimeGuards.enforceResourceLineage(this.ctx, this.ctx.organizationId);

    // 5. Execution safety
    if (contractName === "execution") {
      const auth = this.ctx.resources.lookup(
        "authorization",
        payload.authorizationId,
        this.ctx.organizationId
      );
      if (!auth.ok) throw new Error(auth.errors?.join(", "));
      RuntimeGuards.enforceExecutionSafety(payload, auth.node.payload);
    }

    // 6. Payment safety
    if (contractName === "payment") {
      const exec = this.ctx.resources.lookup(
        "execution",
        payload.executionId,
        this.ctx.organizationId
      );
      if (!exec.ok) throw new Error(exec.errors?.join(", "));
      RuntimeGuards.enforcePaymentSafety(payload, exec.node.payload);
    }

    // 7. Route via subsystem registry
    const subsystem = getSubsystem(this.ctx.subsystem);
    if (!subsystem || !subsystem.runtime) {
      throw new Error(`No runtime registered for subsystem: ${this.ctx.subsystem}`);
    }

    return subsystem.runtime.handle(contractName, payload, this.ctx);
  }
}
