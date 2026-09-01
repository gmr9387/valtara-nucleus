// src/nucleus/runtime/osWorkflowEngine.ts

import { OSPipeline } from "./osPipeline";

export class OSWorkflowEngine {
  constructor(private organizationId: string) {}

  async processClaim(claimPayload: Record<string, any>) {
    const pipeline = new OSPipeline(this.organizationId);
    const result = await pipeline.runClaim(claimPayload);

    return {
      status: "completed",
      claimId: result.claimId,
      organizationId: this.organizationId,
      pipeline: result,
    };
  }
}
