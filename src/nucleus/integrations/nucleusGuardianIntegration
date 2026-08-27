// src/nucleus/integrations/nucleusGuardianIntegration.ts

/**
 * Nucleus ↔ Guardian Integration
 *
 * Constitutional roles:
 * Nucleus  = KNOW
 * Weaver   = FIND
 * Guardian = ALLOW
 *
 * This integration ensures:
 *   - Weaver's opportunities become authorization requests
 *   - Guardian's authorization decisions are observed by Nucleus
 *
 * No execution.
 * No domain logic.
 * No financial movement.
 */

import { subscribe, publishEvent } from "../events/eventBus";
import { NucleusEvent } from "../contracts/NucleusEvent";
import { routeEvent } from "../events/orchestrationRouter";

export function startNucleusGuardianIntegration() {
  // Weaver → Guardian (opportunity → authorization request)
  subscribe("opportunity.detected", async (event: NucleusEvent) => {
    await routeEvent(event);
  });

  // Guardian → Nucleus (authorization decisions)
  subscribe("action.authorized", async (event: NucleusEvent) => {
    await publishEvent({
      ...event,
      type: "nucleus.observed.authorization",
      source: "nucleus",
      payload: event.payload,
    });
  });

  console.log("[Integration] Nucleus ↔ Guardian connected.");
}
