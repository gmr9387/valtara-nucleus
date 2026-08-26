/**
 * eventBus.ts
 *
 * Nucleus Event Bus
 *
 * Swap 29: Add event listeners, routing, and subscriptions.
 */

import { logEvent } from "./supabase/rpc/logEvent";

export interface NucleusEvent {
  id: string;
  source: string;
  type: string;
  context: any;
  payload: any;
  timestamp: string;
}

type EventHandler = (event: NucleusEvent) => Promise<void> | void;

const listeners = new Map<string, Set<EventHandler>>();

export const eventBus = {
  /**
   * Publish event (Swap 28)
   */
  async publishEvent(event: NucleusEvent) {
    try {
      await logEvent(event);
      await this.route(event);
      return { status: "ok" };
    } catch (err: any) {
      console.error("Failed to publish event:", err);
      throw err;
    }
  },

  /**
   * Subscribe to an event type
   */
  subscribe(eventType: string, handler: EventHandler) {
    if (!listeners.has(eventType)) {
      listeners.set(eventType, new Set());
    }
    listeners.get(eventType)!.add(handler);
  },

  /**
   * Unsubscribe from an event type
   */
  unsubscribe(eventType: string, handler: EventHandler) {
    listeners.get(eventType)?.delete(handler);
  },

  /**
   * Route event to all listeners
   */
  async route(event: NucleusEvent) {
    const handlers = listeners.get(event.type);
    if (!handlers) return;

    for (const handler of handlers) {
      try {
        await handler(event);
      } catch (err) {
        console.error(`Event handler failed for ${event.type}:`, err);
      }
    }
  },

  /**
   * Listen to a single event (manual trigger)
   */
  async listen(event: NucleusEvent) {
    await this.route(event);
  }
};
