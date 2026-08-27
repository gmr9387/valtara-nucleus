// src/nucleus/integrations/nucleusGlueIntegration.ts

/**
 * Nucleus ↔ Glue Integration
 *
 * Constitutional roles:
 * Nucleus  = KNOW
 * Guardian = ALLOW
 * Glue     = DO
 *
 * This integration ensures:
 *   - Guardian's authorization decisions become execution requests
 *   - Glue's execution results are observed by Nucleus
 *
 * No discovery.
 * No domain logic.
 * No financial movement.
 */

import { subscribe, publishEvent } from "../events/eventBus";
import { NucleusEvent } from "../contracts/NucleusEvent";
import { routeEvent } from "../events/orchestrationRouter";

export function startNucleusGlueIntegration() {
  // Guardian → Glue (authorization → execution request)
  subscribe("action.authorized", async (event: NucleusEvent) => {
    await routeEvent(event);
  });

  // Glue → Nucleus (execution results)
  subscribe("execution.completed", async (event: NucleusEvent) => {
    await publishEvent({
      ...event,
      type: "nucleus.observed.execution",
      source: "nucleus",
      payload: event.payload,
    });
  });

  console.log("[Integration] Nucleus ↔ Glue connected.");
}
