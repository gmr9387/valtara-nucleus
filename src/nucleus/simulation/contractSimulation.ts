// Phase 7.2 — ContractSimulationEngine
// Validates + simulates contract emission without touching real state

import { validateContract } from "../contracts/contractRegistry";
import { NucleusEvent } from "../events/nucleusEvent";
import { NucleusIdentity } from "../identity/nucleusIdentity";
import { eventBus } from "../events/eventBus";

export interface SimulatedContract {
  name: string;
  version: string;
  payload: unknown;
  identity: NucleusIdentity;
  subsystem: string;
  correlationId?: string;
  traceId?: string;
}

export class ContractSimulationEngine {
  static simulate(contract: SimulatedContract): NucleusEvent {
    const validation = validateContract(
      contract.name,
      contract.version,
      contract.payload
    );

    if (!validation.valid) {
      throw new Error(
        `Invalid simulated contract: ${contract.name}@${contract.version}`
      );
    }

    const nucleusEvent: NucleusEvent = {
      type: contract.name,
      version: contract.version,
      payload: contract.payload,
      source: contract.subsystem,
      context: contract.identity,
      timestamp: new Date().toISOString(),
      correlationId: contract.correlationId,
      traceId: contract.traceId,
      simulated: true,
    };

    eventBus.emit(nucleusEvent);
    return nucleusEvent;
  }
}
