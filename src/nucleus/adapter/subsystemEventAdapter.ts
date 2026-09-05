// Phase 19 — SubsystemEventAdapter with identity enforcement

import { NucleusEvent } from "../events/nucleusEvent";
import { NucleusIdentity, NucleusSubsystem } from "../identity/nucleusIdentity";
import { eventBus } from "../events/eventBus";

export interface SubsystemEventInput {
  subsystem: NucleusSubsystem;
  type: string;
  version: string;
  payload: unknown;
  identity: NucleusIdentity;
  simulated?: boolean;
  correlationId?: string;
  traceId?: string;
}

export class SubsystemEventAdapter {
  static emit(input: SubsystemEventInput): NucleusEvent {
    const identity: NucleusIdentity = {
      ...input.identity,
      subsystem: input.subsystem,
    };

    if (!identity.tenantId) throw new Error("Missing tenantId");
    if (!identity.environmentId) throw new Error("Missing environmentId");
    if (!identity.projectId) throw new Error("Missing projectId");

    if (identity.actorId && typeof identity.actorId !== "string") {
      throw new Error("Invalid actorId");
    }

    if (!identity.subsystem) throw new Error("Missing subsystem");
    if (!identity.capability) throw new Error("Missing capability");

    const event: NucleusEvent = {
      type: input.type,
      version: input.version,
      payload: input.payload,
      source: input.subsystem,
      context: identity,
      timestamp: new Date().toISOString(),
      correlationId: input.correlationId,
      traceId: input.traceId,
      simulated: input.simulated,
    };

    eventBus.emit(event);
    return event;
  }
}
