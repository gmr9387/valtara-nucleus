// Phase 19 — EventBus with identity propagation and enforcement

import { NucleusEvent } from "./nucleusEvent";

type EventHandler = (event: NucleusEvent) => void;

class EventBus {
  private handlers: EventHandler[] = [];

  subscribe(handler: EventHandler) {
    this.handlers.push(handler);
  }

  emit(event: NucleusEvent) {
    const ctx = event.context;

    if (!ctx.tenantId) throw new Error("Missing tenantId");
    if (!ctx.environmentId) throw new Error("Missing environmentId");
    if (!ctx.projectId) throw new Error("Missing projectId");

    if (ctx.actorId && typeof ctx.actorId !== "string") {
      throw new Error("Invalid actorId");
    }

    if (!ctx.subsystem) throw new Error("Missing subsystem");
    if (!ctx.capability) throw new Error("Missing capability");

    for (const handler of this.handlers) {
      handler(event);
    }
  }
}

export const eventBus = new EventBus();
