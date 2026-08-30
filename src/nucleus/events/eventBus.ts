// src/nucleus/events/eventBus.ts
// Full file — Unified Constitutional Event Bus

import { NucleusEvent } from "../contracts/NucleusEvent";

export type EventHandler = (event: NucleusEvent) => void | Promise<void>;

const handlers = new Map<string, EventHandler[]>();

/**
 * subscribe(eventType, handler)
 *
 * Subsystems subscribe to specific event types.
 * Use "*" to subscribe to all events.
 */
export function subscribe(eventType: string, handler: EventHandler) {
  const list = handlers.get(eventType) ?? [];
  list.push(handler);
  handlers.set(eventType, list);
}

/**
 * publishEvent(event)
 *
 * Emits an event to all matching handlers.
 * First specific handlers, then wildcard handlers.
 */
export async function publishEvent(event: NucleusEvent) {
  const specific = handlers.get(event.type) ?? [];
  const wildcard = handlers.get("*") ?? [];

  for (const handler of [...specific, ...wildcard]) {
    await handler(event);
  }
}
