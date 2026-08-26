/**
 * realtimeWorkflowStream.ts
 *
 * Swap 39: Real-Time Workflow Stream
 *
 * Streams workflow state changes into the event bus.
 */

import { supabase } from "./supabase/supabaseClient";
import { eventBus } from "./eventBus";

export function startRealtimeWorkflowStream() {
  const channel = supabase.channel("nucleus-workflows");

  channel
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "nucleus_events" },
      (payload) => {
        if (!payload.new.type.startsWith("workflow.")) return;

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
