// src/nucleus/runtime/osPipeline.ts

import { WeaverRuntime } from "../subsystems/weaver/weaverRuntime";
import { GuardianRuntime } from "../subsystems/guardian/guardianRuntime";
import { GlueRuntime } from "../subsystems/glue/glueRuntime";
import { DualPayRuntime } from "../subsystems/dualpay/dualpayRuntime";
import { ContractsRuntime } from "../subsystems/contracts/contractsRuntime";

export class OSPipeline {
  constructor(private organizationId: string) {}

  async runClaim(claimPayload: Record<string, any>) {
    const claimId = claimPayload.claimId || `claim-${Date.now()}`;

    // 1. Weaver — discover opportunity, anomalies, patterns
    const weaver = new WeaverRuntime(this.organizationId);
    const weaverResult = await weaver.run({
      claimId,
      organizationId: this.organizationId,
      claimPayload,
    });

    // 2. Guardian — risk, rules, scoring, kill-switch, repair, lifecycle
    const guardian = new GuardianRuntime(this.organizationId);
    const guardianResult = await guardian.run({
      claimId,
      organizationId: this.organizationId,
      claimPayload,
    });

    // 3. Glue — orchestrate execution
    const glue = new GlueRuntime(this.organizationId);
    const glueResult = await glue.run({
      claimId,
      organizationId: this.organizationId,
      claimPayload,
      guardian: guardianResult,
      weaver: weaverResult,
    });

    // 4. DualPay — healthcare financial intelligence
    const dualpay = new DualPayRuntime(this.organizationId);
    const dualpayResult = await dualpay.run({
      claimId,
      organizationId: this.organizationId,
      claimPayload,
      guardian: guardianResult,
      glue: glueResult,
    });

    // 5. Contracts — adjudication + allowed amounts
    const contracts = new ContractsRuntime(this.organizationId);
    const contractsResult = await contracts.run({
      claimId,
      organizationId: this.organizationId,
      claimPayload,
      dualpay: dualpayResult,
    });

    return {
      claimId,
      organizationId: this.organizationId,
      weaver: weaverResult,
      guardian: guardianResult,
      glue: glueResult,
      dualpay: dualpayResult,
      contracts: contractsResult,
    };
  }
}
