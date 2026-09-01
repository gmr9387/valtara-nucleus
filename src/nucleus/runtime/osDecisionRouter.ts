// src/nucleus/runtime/osDecisionRouter.ts

/**
 * OSDecisionRouter (Phase 15)
 *
 * Pure router: routes claims into OSWorkflowEngine.
 * No HTTP. No transport. No external dependencies.
 */

import { OSWorkflowEngine } from "./osWorkflowEngine";

export class OSDecisionRouter {
  static routeClaim(organizationId: string, claimPayload: Record<string, any>) {
    return OSWorkflowEngine.processClaim(organizationId, claimPayload);
  }
}
