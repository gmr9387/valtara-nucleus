// Phase 24 — Subsystem Simulation

import { SimulationContext } from "./simulationContext";
import { eventSimulation } from "./eventSimulation";
import { contractSimulation } from "./contractSimulation";

export class SubsystemSimulation {
  constructor(private subsystem: string) {}

  event(type: string, version: string, payload: unknown, ctx: SimulationContext) {
    return eventSimulation.simulateEvent(type, version, payload, ctx);
  }

  contract(name: string, version: string, payload: unknown, ctx: SimulationContext) {
    return contractSimulation.simulateContract(name, version, payload, ctx);
  }
}

export function createSubsystemSimulation(subsystem: string) {
  return new SubsystemSimulation(subsystem);
}
