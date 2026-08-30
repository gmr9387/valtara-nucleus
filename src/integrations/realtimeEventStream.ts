/**
 * realtimeEventStream.ts
 *
 * Swap 38: Real-Time Event Stream
 *
 * Streams all Supabase events into the Nucleus event bus.
 */

import { supabase } from "./supabase/supabaseClient";
import { eventBus } from "./eventBus";

export function startRealtimeEventStream() {
  const channel = supabase.channel("nucleus-events");

  channel
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "nucleus_events" },
      (payload) => {
        const event = {
          id: payload.new.id,
          source: payload.new.source,
          type: payload.new.type,
          context: payload.new.context,
          payload: payload.new.payload,
          timestamp: payload.new.timestamp
        };

        eventBus.publishEvent(event);
      }
    )
    .subscribe();
}
