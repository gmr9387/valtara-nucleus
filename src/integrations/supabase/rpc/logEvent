/**
 * logEvent.ts
 *
 * RPC wrapper for logging Nucleus events.
 */

import { supabase } from "../supabaseClient";
import { NucleusEvent } from "../../eventBus";

export async function logEvent(event: NucleusEvent) {
  const { error } = await supabase.rpc("rpc_log_event", {
    event
  });

  if (error) {
    throw new Error(`Failed to log event: ${error.message}`);
  }
}
