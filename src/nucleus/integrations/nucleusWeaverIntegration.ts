// src/nucleus/integrations/nucleusWeaverIntegration.ts

/**
 * Nucleus ↔ Weaver Integration
 *
 * Constitutional roles:
 * Nucleus = KNOW
 * Weaver  = FIND
 *
 * This integration ensures:
 *   - Nucleus can route discovery events to Weaver
 *   - Weaver can emit opportunities back to Nucleus
 *
 * No authorization.
 * No execution.
 * No domain logic.
 */

import { subscribe, publishEvent } from "../events/eventBus";
import { NucleusEvent } from "../contracts/NucleusEvent";
import { routeEvent } from "../events/orchestrationRouter";

export function startNucleusWeaverIntegration() {
  // Nucleus listens for raw claim events and routes them
  subscribe("claim.received", async (event: NucleusEvent) => {
    await routeEvent(event);
  });

  // Weaver emits opportunities → Nucleus observes them
  subscribe("opportunity.detected", async (event: NucleusEvent) => {
    await publishEvent({
      ...event,
      type: "nucleus.observed.opportunity",
      source: "nucleus",
      payload: event.payload,
    });
  });

  console.log("[Integration] Nucleus ↔ Weaver connected.");
}
