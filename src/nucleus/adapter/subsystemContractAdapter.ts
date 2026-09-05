// Phase 6.2 — SubsystemContractAdapter
// Validates subsystem contracts → NucleusEvent → eventBus

import { validateContract } from "../contracts/contractRegistry";
import { NucleusEvent } from "../events/nucleusEvent";
import { NucleusIdentity } from "../identity/nucleusIdentity";
import { eventBus } from "../events/eventBus";

export interface SubsystemContract {
  name: string;
  version: string;
  payload: unknown;
  subsystem: "weaver" | "guardian" | "glue" | "dualpay";
  identity: NucleusIdentity;
  correlationId?: string;
  traceId?: string;
}

export class SubsystemContractAdapter {
  static toNucleusEvent(contract: SubsystemContract): NucleusEvent {
    const validation = validateContract(
      contract.name,
      contract.version,
      contract.payload
    );

    if (!validation.valid) {
      throw new Error(
        `Invalid subsystem contract: ${contract.name}@${contract.version}`
      );
    }

    return {
      type: contract.name,
      version: contract.version,
      payload: contract.payload,
      source: contract.subsystem,
      context: contract.identity,
      timestamp: new Date().toISOString(),
      correlationId: contract.correlationId,
      traceId: contract.traceId,
    };
  }

  static emit(contract: SubsystemContract): NucleusEvent {
    const nucleusEvent = this.toNucleusEvent(contract);
    eventBus.emit(nucleusEvent);
    return nucleusEvent;
  }
}
