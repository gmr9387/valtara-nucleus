// Phase 19 — ExternalEventAdapter with identity enforcement

import { NucleusEvent } from "../events/nucleusEvent";
import { NucleusIdentity } from "../identity/nucleusIdentity";
import { eventBus } from "../events/eventBus";

export interface ExternalEventInput {
  type: string;
  version: string;
  payload: unknown;
  identity: NucleusIdentity;
  source: string;
  correlationId?: string;
  traceId?: string;
}

export class ExternalEventAdapter {
  static emit(input: ExternalEventInput): NucleusEvent {
    const identity = input.identity;

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
      source: input.source,
      context: identity,
      timestamp: new Date().toISOString(),
      correlationId: input.correlationId,
      traceId: input.traceId,
    };

    eventBus.emit(event);
    return event;
  }
}
