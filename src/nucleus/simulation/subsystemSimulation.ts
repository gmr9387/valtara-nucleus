// Phase 7.3 — SubsystemSimulationHarness
// Simulates subsystem → NucleusEvent emission

import { SubsystemEventAdapter } from "../adapter/subsystemEventAdapter";
import { SubsystemContractAdapter } from "../adapter/subsystemContractAdapter";
import { NucleusIdentity } from "../identity/nucleusIdentity";

export class SubsystemSimulationHarness {
  static simulateEvent(
    subsystem: "weaver" | "guardian" | "glue" | "dualpay",
    type: string,
    version: string,
    payload: unknown,
    identity: NucleusIdentity
  ) {
    return SubsystemEventAdapter.emit({
      subsystem,
      type,
      version,
      payload,
      identity,
      simulated: true,
    } as any);
  }

  static simulateContract(
    subsystem: "weaver" | "guardian" | "glue" | "dualpay",
    name: string,
    version: string,
    payload: unknown,
    identity: NucleusIdentity
  ) {
    return SubsystemContractAdapter.emit({
      subsystem,
      name,
      version,
      payload,
      identity,
      simulated: true,
    } as any);
  }
}
