// Phase 27 — Unified Nucleus Runtime

import { eventBus } from "../events/eventBus";
import { stateEngine } from "../state/stateEngine";
import { weaverRuntime } from "../subsystems/weaverRuntime";
import { guardianRuntime } from "../subsystems/guardianRuntime";
import { glueRuntime } from "../subsystems/glueRuntime";
import { dualpayRuntime } from "../subsystems/dualpayRuntime";
import { contractSimulation } from "../simulation/contractSimulation";
import { eventSimulation } from "../simulation/eventSimulation";
import { resourceGraph } from "../resources/resourceGraph";
import { lineageEngine } from "../lineage/lineageEngine";
import { telemetryEngine } from "../telemetry/telemetryEngine";

export class NucleusRuntime {
  constructor() {
    // Wire eventBus → stateEngine
    eventBus.subscribe((event) => {
      stateEngine.applyEvent(event);
    });
  }

  // Subsystem accessors
  get weaver() {
    return weaverRuntime;
  }

  get guardian() {
    return guardianRuntime;
  }

  get glue() {
    return glueRuntime;
  }

  get dualpay() {
    return dualpayRuntime;
  }

  // Simulation accessors
  get simulateEvent() {
    return eventSimulation;
  }

  get simulateContract() {
    return contractSimulation;
  }

  // Resource graph access
  get resources() {
    return resourceGraph;
  }

  // Lineage access
  get lineage() {
    return lineageEngine;
  }

  // Telemetry access
  get telemetry() {
    return telemetryEngine;
  }
}

export const nucleus = new NucleusRuntime();
