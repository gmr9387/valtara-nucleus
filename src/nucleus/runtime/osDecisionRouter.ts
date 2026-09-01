// src/nucleus/runtime/osDecisionRouter.ts

/**
 * OSDecisionRouter (Phase 13 — Tightened)
 *
 * Pure router: routes claims into OSWorkflowEngine.
 */

import { OSWorkflowEngine, OSWorkflowResult } from "./osWorkflowEngine";

export class OSDecisionRouter {
  static routeClaim(
    organizationId: string,
    claimPayload: Record<string, any>
  ): OSWorkflowResult {
    return OSWorkflowEngine.processClaim(organizationId, claimPayload);
  }
}
