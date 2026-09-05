// Phase 25 — Base Subsystem Runtime

import { NucleusIdentity } from "../identity/nucleusIdentity";
import { eventSimulation } from "../simulation/eventSimulation";
import { contractSimulation } from "../simulation/contractSimulation";
import { stateEngine } from "../state/stateEngine";

export abstract class SubsystemRuntime {
  constructor(public subsystem: NucleusIdentity["subsystem"]) {}

  protected buildIdentity(capability: string, identity: NucleusIdentity): NucleusIdentity {
    return {
      ...identity,
      subsystem: this.subsystem,
      capability,
    };
  }

  emitEvent(
    type: string,
    version: string,
    payload: unknown,
    identity: NucleusIdentity
  ) {
    const event = eventSimulation.simulateEvent(
      type,
      version,
      payload,
      { identity: { ...identity, subsystem: this.subsystem }, simulated: true }
    );

    stateEngine.applyEvent(event);
    return event;
  }

  emitContract(
    name: string,
    version: string,
    payload: unknown,
    identity: NucleusIdentity
  ) {
    const event = contractSimulation.simulateContract(
      name,
      version,
      payload,
      { identity: { ...identity, subsystem: this.subsystem }, simulated: true }
    );

    stateEngine.applyEvent(event);
    return event;
  }
}
