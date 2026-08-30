// src/nucleus/runtime/runtimeRouter.ts

/**
 * Runtime Router (Phase 3.2)
 *
 * Purpose:
 *   Central dispatcher for all subsystem contract emissions.
 *
 * Responsibilities:
 *     - enforce subsystem permissions
 *     - validate contract payloads
 *     - enforce contract lineage
 *     - enforce resource lineage
 *     - enforce execution + payment safety
 *     - route to subsystem runtimes
 */

import { RuntimeContext, RuntimeGuards } from "./runtimeGuards";
import { WeaverRuntime } from "../subsystems/weaver/weaverRuntime";
import { GuardianRuntime } from "../subsystems/guardian/guardianRuntime";
import { GlueRuntime } from "../subsystems/glue/glueRuntime";
import { DualPayRuntime } from "../subsystems/dualpay/dualPayRuntime";

export class RuntimeRouter {
  constructor(private ctx: RuntimeContext) {}

  /**
   * Dispatch a contract to the correct subsystem runtime.
   */
  dispatch(contractName: string, version: string, payload: any) {
    // 1. Subsystem permission enforcement
    RuntimeGuards.enforceSubsystemPermission(this.ctx, contractName);

    // 2. Contract payload validation
    RuntimeGuards.validateContractPayload(contractName, version, payload);

    // 3. Contract lineage enforcement
    RuntimeGuards.enforceContractLineage(contractName, payload);

    // 4. Resource lineage enforcement (tenant isolation)
    RuntimeGuards.enforceResourceLineage(this.ctx, payload.organizationId);

    // 5. Execution safety (if applicable)
    if (contractName === "execution") {
      const auth = this.ctx.resources.lookup(
        "authorization",
        payload.authorizationId,
        this.ctx.organizationId
      );
      if (!auth.ok) throw new Error(auth.errors?.join(", "));
      RuntimeGuards.enforceExecutionSafety(payload, auth.node.payload);
    }

    // 6. Payment safety (if applicable)
    if (contractName === "payment") {
      const exec = this.ctx.resources.lookup(
        "execution",
        payload.executionId,
        this.ctx.organizationId
      );
      if (!exec.ok) throw new Error(exec.errors?.join(", "));
      RuntimeGuards.enforcePaymentSafety(payload, exec.node.payload);
    }

    // 7. Route to subsystem runtime
    switch (this.ctx.subsystem) {
      case "weaver":
        return WeaverRuntime.handle(contractName, payload);

      case "guardian":
        return GuardianRuntime.handle(contractName, payload);

      case "glue":
        return GlueRuntime.handle(contractName, payload);

      case "dualpay":
        return DualPayRuntime.handle(contractName, payload);

      default:
        throw new Error(`Unknown subsystem: ${this.ctx.subsystem}`);
    }
  }
}
