// src/nucleus/runtime/osPipeline.ts

import { WeaverRuntime } from "../subsystems/weaver/weaverRuntime";
import { GuardianRuntime } from "../subsystems/guardian/guardianRuntime";
import { GlueRuntime } from "../subsystems/glue/glueRuntime";
import { DualPayRuntime } from "../subsystems/dualpay/dualPayRuntime";

import { TelemetryAdapter } from "../subsystems/telemetry/telemetryAdapter";

export class OSPipeline {
  static runClaim(organizationId: string, claimPayload: Record<string, any>) {
    const claimId = claimPayload.claimId || `claim-${Date.now()}`;

    const base = { claimId, organizationId, claimPayload };

    // Weaver — Opportunity
    const opportunity = WeaverRuntime.handle("opportunity", base);
    TelemetryAdapter.send("weaver.opportunity", opportunity);

    // Weaver — Recommendation
    const recommendation = WeaverRuntime.handle("recommendation", {
      ...base,
      opportunity,
    });
    TelemetryAdapter.send("weaver.recommendation", recommendation);

    // Guardian — Authorization
    const authorization = GuardianRuntime.handle("authorization", {
      ...base,
      opportunity,
      recommendation,
    });
    TelemetryAdapter.send("guardian.authorization", authorization);

    // Glue — Execution
    const execution = GlueRuntime.handle("execution", {
      ...base,
      authorization,
      opportunity,
      recommendation,
    });
    TelemetryAdapter.send("glue.execution", execution);

    // DualPay — Payment
    const payment = DualPayRuntime.handle("payment", {
      ...base,
      execution,
      authorization,
      opportunity,
      recommendation,
    });
    TelemetryAdapter.send("dualpay.payment", payment);

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
