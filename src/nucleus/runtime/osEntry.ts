// src/nucleus/runtime/osEntry.ts

/**
 * OS Entry (Phase 15)
 *
 * The single, stable entrypoint for claim processing.
 * External systems call ONLY this function.
 */

import { OSDecisionRouter } from "./osDecisionRouter";

export class OSEntry {
  static processClaim(organizationId: string, claimPayload: Record<string, any>) {
    return OSDecisionRouter.routeClaim(organizationId, claimPayload);
  }
}
