// src/nucleus/integrations/nucleusHealthMonitor.ts

/**
 * Nucleus Health Monitor
 *
 * Constitutional role:
 * Nucleus = KNOW
 *
 * This integration monitors subsystem health by:
 *   - observing events
 *   - updating health status
 *   - detecting degraded/offline subsystems
 *
 * No execution.
 * No authorization.
 * No domain logic.
 */

import { subscribe } from "../events/eventBus";
import { setSubsystemHealth } from "../state/nucleusState";
import { NucleusEvent } from "../contracts/NucleusEvent";

const HEALTH_TIMEOUT_MS = 10_000; // 10 seconds without events = degraded

const lastSeen: Record<string, number> = {
  nucleus: Date.now(),
  weaver: Date.now(),
  guardian: Date.now(),
  glue: Date.now(),
  dualpay: Date.now(),
};

export function startNucleusHealthMonitor() {
  // Observe all events and update subsystem last-seen timestamps
  subscribe("*", (event: NucleusEvent) => {
    if (event.source) {
      lastSeen[event.source] = Date.now();
      setSubsystemHealth(event.source, "healthy");
    }
  });

  // Periodically check subsystem health
  setInterval(() => {
    const now = Date.now();

    for (const subsystem of Object.keys(lastSeen)) {
      const delta = now - lastSeen[subsystem];

      if (delta > HEALTH_TIMEOUT_MS * 3) {
        setSubsystemHealth(subsystem, "offline");
      } else if (delta > HEALTH_TIMEOUT_MS) {
        setSubsystemHealth(subsystem, "degraded");
      } else {
        setSubsystemHealth(subsystem, "healthy");
      }
    }
  }, 2_000);

  console.log("[Nucleus] Health Monitor Active.");
}
