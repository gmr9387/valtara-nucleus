// src/nucleus/runtime/osWorkflowEngine.ts

/**
 * OSWorkflowEngine (Phase 13 — Tightened)
 *
 * Thin wrapper around OSPipeline.
 */

import { OSPipeline, OSPipelineResult } from "./osPipeline";

export type OSWorkflowResult = {
  status: "completed";
  claimId: string;
  organizationId: string;
  pipeline: OSPipelineResult;
};

export class OSWorkflowEngine {
  static processClaim(
    organizationId: string,
    claimPayload: Record<string, any>
  ): OSWorkflowResult {
    const pipeline = OSPipeline.runClaim(organizationId, claimPayload);

    return {
      status: "completed",
      claimId: pipeline.claimId,
      organizationId,
      pipeline,
    };
  }
}
