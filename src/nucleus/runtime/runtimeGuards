// src/nucleus/runtime/runtimeGuards.ts

/**
 * Runtime Guards (Phase 3)
 *
 * Purpose:
 *   Enforce constitutional invariants at runtime:
 *     - subsystem identity
 *     - subsystem permissions
 *     - contract lineage validation
 *     - resource lineage validation
 *     - cross-contract consistency
 *     - cross-resource consistency
 *     - execution safety
 *     - authorization safety
 *     - payment safety
 *
 * This is the core of Phase 3: Runtime Hardening.
 */

import { validateContract } from "../contracts/contractRegistry";
import { ResourceService } from "../resources/resourceService";

export type Subsystem =
  | "weaver"
  | "guardian"
  | "glue"
  | "dualpay"
  | "nucleus";

export interface RuntimeContext {
  subsystem: Subsystem;
  organizationId: string;
  resources: ResourceService;
}

export class RuntimeGuards {
  /**
   * Enforce subsystem identity:
   *   Only the correct subsystem may emit certain contracts.
   */
  static enforceSubsystemPermission(ctx: RuntimeContext, contractName: string) {
    const allowed: Record<string, Subsystem[]> = {
      opportunity: ["weaver"],
      recommendation: ["weaver"],
      authorization: ["guardian"],
      execution: ["glue"],
      payment: ["dualpay"],
    };

    const permitted = allowed[contractName];
    if (!permitted) {
      throw new Error(`Unknown contract: ${contractName}`);
    }

    if (!permitted.includes(ctx.subsystem)) {
      throw new Error(
        `Subsystem ${ctx.subsystem} is not permitted to emit ${contractName}`
      );
    }
  }

  /**
   * Validate contract payload using contract registry.
   */
  static validateContractPayload(
    contractName: string,
    version: string,
    payload: any
  ) {
    const result = validateContract(contractName as any, version as any, payload);
    if (!result.ok) {
      throw new Error(
        `Contract validation failed for ${contractName}:${version}: ${result.errors?.join(
          ", "
        )}`
      );
    }
  }

  /**
   * Validate resource lineage for the subsystem.
   * Prevents cross-tenant access.
   */
  static enforceResourceLineage(ctx: RuntimeContext, resourceId: string) {
    const lookup = ctx.resources.lookup("organization", resourceId, ctx.organizationId);
    if (!lookup.ok) {
      throw new Error(
        `Resource lineage violation: ${lookup.errors?.join(", ")}`
      );
    }
  }

  /**
   * Cross-contract lineage validation:
   *   - recommendation must reference opportunity
   *   - authorization must reference recommendation + opportunity
   *   - execution must reference authorization + recommendation + opportunity
   *   - payment must reference execution + authorization + recommendation + opportunity
   */
  static enforceContractLineage(contractName: string, payload: any) {
    const lineageRules: Record<string, string[]> = {
      recommendation: ["opportunityId"],
      authorization: ["recommendationId", "opportunityId"],
      execution: ["authorizationId", "recommendationId", "opportunityId"],
      payment: [
        "executionId",
        "authorizationId",
        "recommendationId",
        "opportunityId",
      ],
    };

    const required = lineageRules[contractName];
    if (!required) return;

    const missing = required.filter((field) => !payload[field]);
    if (missing.length > 0) {
      throw new Error(
        `Lineage violation in ${contractName}: missing ${missing.join(", ")}`
      );
    }
  }

  /**
   * Execution safety:
   *   - execution must match authorization intent
   */
  static enforceExecutionSafety(execution: any, authorization: any) {
    if (execution.executionType !== authorization.payload.executionType) {
      throw new Error(
        `Execution type mismatch: expected ${authorization.payload.executionType}, got ${execution.executionType}`
      );
    }
  }

  /**
   * Payment safety:
   *   - payment must match execution intent
   */
  static enforcePaymentSafety(payment: any, execution: any) {
    if (payment.amount !== execution.payload.amount) {
      throw new Error(
        `Payment amount mismatch: expected ${execution.payload.amount}, got ${payment.amount}`
      );
    }
  }
}
