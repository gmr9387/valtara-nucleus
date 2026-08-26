/**
 * realtimeDecisionStream.ts
 *
 * Swap 40: Real-Time Decision Stream
 *
 * Streams decision evaluations into the event bus.
 */

import { supabase } from "./supabase/supabaseClient";
import { eventBus } from "./eventBus";

export function startRealtimeDecisionStream() {
  const channel = supabase.channel("nucleus-decisions");

  channel
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "nucleus_events" },
      (payload) => {
        if (!payload.new.type.startsWith("decision.")) return;

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
