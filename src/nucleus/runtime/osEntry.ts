// src/nucleus/runtime/osEntry.ts

/**
 * OSEntry (Phase 18 — Hardened)
 *
 * The single, stable entrypoint for claim processing.
 * Now includes defensive validation.
 */

import { OSDecisionRouter } from "./osDecisionRouter";
import { OSEntryValidation } from "./osEntry.validation";

export class OSEntry {
  static processClaim(organizationId: string, claimPayload: Record<string, any>) {
    OSEntryValidation.validateOrganizationId(organizationId);
    OSEntryValidation.validateClaimPayload(claimPayload);

    return OSDecisionRouter.routeClaim(organizationId, claimPayload);
  }
}
