// Phase 24 — Simulation Context

import { NucleusIdentity } from "../identity/nucleusIdentity";

export interface SimulationContext {
  identity: NucleusIdentity;
  simulated: true;
}
