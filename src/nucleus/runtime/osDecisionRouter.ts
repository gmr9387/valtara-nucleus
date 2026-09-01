// src/nucleus/runtime/osDecisionRouter.ts

/**
 * OSDecisionRouter (Phase 12)
 *
 * Pure router: routes claims into OSWorkflowEngine.
 * Assumes caller handles HTTP / transport concerns.
 */

import { OSWorkflowEngine } from "./osWorkflowEngine";

export class OSDecisionRouter {
  static routeClaim(organizationId: string, claimPayload: Record<string, any>) {
    return OSWorkflowEngine.processClaim(organizationId, claimPayload);
  }
}
