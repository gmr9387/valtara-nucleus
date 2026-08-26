/**
 * eventStore.ts
 *
 * Supabase binding for Nucleus event bus.
 */

import { supabase } from "./supabaseClient";
import { NucleusEvent } from "../eventBus";

export async function storeEvent(event: NucleusEvent) {
  return await supabase.from("nucleus_events").insert({
    id: event.id,
    source: event.source,
    type: event.type,
    context: event.context,
    payload: event.payload,
    timestamp: event.timestamp
  });
}
