// src/nucleus/runtime/osPipeline.ts

/**
 * OSPipeline (Phase 12)
 *
 * Contract-first OS pipeline:
 *   opportunity → recommendation → authorization → execution → payment
 */

import { WeaverRuntime } from "../subsystems/weaver/weaverRuntime";
import { GuardianRuntime } from "../subsystems/guardian/guardianRuntime";
import { GlueRuntime } from "../subsystems/glue/glueRuntime";
import { DualPayRuntime } from "../subsystems/dualpay/dualPayRuntime";

export class OSPipeline {
  static runClaim(organizationId: string, claimPayload: Record<string, any>) {
    const claimId = claimPayload.claimId || `claim-${Date.now()}`;

    // 1. Weaver → opportunity
    const opportunity = WeaverRuntime.handle("opportunity", {
      claimId,
      organizationId,
      claimPayload,
    });

    // 2. Weaver → recommendation
    const recommendation = WeaverRuntime.handle("recommendation", {
      claimId,
      organizationId,
      claimPayload,
      opportunity,
    });

    // 3. Guardian → authorization
    const authorization = GuardianRuntime.handle("authorization", {
      claimId,
      organizationId,
      claimPayload,
      opportunity,
      recommendation,
    });

    // 4. Glue → execution
    const execution = GlueRuntime.handle("execution", {
      claimId,
      organizationId,
      claimPayload,
      authorization,
      opportunity,
      recommendation,
    });

    // 5. DualPay → payment
    const payment = DualPayRuntime.handle("payment", {
      claimId,
      organizationId,
      claimPayload,
      execution,
      authorization,
      opportunity,
      recommendation,
    });

    return {
      claimId,
      organizationId,
      opportunity,
      recommendation,
      authorization,
      execution,
      payment,
    };
  }
}
