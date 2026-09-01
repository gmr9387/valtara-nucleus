// src/nucleus/runtime/osWorkflowEngine.ts

/**
 * OSWorkflowEngine (Phase 12)
 *
 * Thin wrapper around OSPipeline.
 */

import { OSPipeline } from "./osPipeline";

export class OSWorkflowEngine {
  static processClaim(organizationId: string, claimPayload: Record<string, any>) {
    const result = OSPipeline.runClaim(organizationId, claimPayload);

    return {
      status: "completed",
      claimId: result.claimId,
      organizationId,
      pipeline: result,
    };
  }
}
