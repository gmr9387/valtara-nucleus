// Phase 7.1 — EventSimulationEngine
// Simulates NucleusEvent emission without touching real state

import { NucleusEvent } from "../events/nucleusEvent";
import { NucleusIdentity } from "../identity/nucleusIdentity";
import { eventBus } from "../events/eventBus";

export interface SimulatedEvent {
  type: string;
  version: string;
  payload: unknown;
  identity: NucleusIdentity;
  source: string;
  correlationId?: string;
  traceId?: string;
}

export class EventSimulationEngine {
  static simulate(event: SimulatedEvent): NucleusEvent {
    const nucleusEvent: NucleusEvent = {
      type: event.type,
      version: event.version,
      payload: event.payload,
      source: event.source,
      context: event.identity,
      timestamp: new Date().toISOString(),
      correlationId: event.correlationId,
      traceId: event.traceId,
      simulated: true,
    };

    eventBus.emit(nucleusEvent);
    return nucleusEvent;
  }
}
