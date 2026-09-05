// Phase 6.1 — SubsystemEventAdapter
// Normalizes subsystem → NucleusEvent → eventBus

import { NucleusEvent } from "../events/nucleusEvent";
import { NucleusIdentity } from "../identity/nucleusIdentity";
import { eventBus } from "../events/eventBus";

export interface SubsystemEvent {
  type: string;
  version: string;
  payload: unknown;
  subsystem: "weaver" | "guardian" | "glue" | "dualpay";
  identity: NucleusIdentity;
  correlationId?: string;
  traceId?: string;
}

export class SubsystemEventAdapter {
  static toNucleusEvent(event: SubsystemEvent): NucleusEvent {
    return {
      type: event.type,
      version: event.version,
      payload: event.payload,
      source: event.subsystem,
      context: event.identity,
      timestamp: new Date().toISOString(),
      correlationId: event.correlationId,
      traceId: event.traceId,
    };
  }

  static emit(event: SubsystemEvent): NucleusEvent {
    const nucleusEvent = this.toNucleusEvent(event);
    eventBus.emit(nucleusEvent);
    return nucleusEvent;
  }
}
