// src/nucleus/runtime/osPipeline.ts

import { WeaverRuntime } from "../subsystems/weaver/weaverRuntime";
import { GuardianRuntime } from "../subsystems/guardian/guardianRuntime";
import { GlueRuntime } from "../subsystems/glue/glueRuntime";
import { DualPayRuntime } from "../subsystems/dualpay/dualPayRuntime";

export class OSPipeline {
  static runClaim(organizationId: string, claimPayload: Record<string, any>) {
    const claimId = claimPayload.claimId || `claim-${Date.now()}`;

    const base = { claimId, organizationId, claimPayload };

    const opportunity = WeaverRuntime.handle("opportunity", base);

    const recommendation = WeaverRuntime.handle("recommendation", {
      ...base,
      opportunity,
    });

    const authorization = GuardianRuntime.handle("authorization", {
      ...base,
      opportunity,
      recommendation,
    });

    const execution = GlueRuntime.handle("execution", {
      ...base,
      authorization,
      opportunity,
      recommendation,
    });

    const payment = DualPayRuntime.handle("payment", {
      ...base,
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
