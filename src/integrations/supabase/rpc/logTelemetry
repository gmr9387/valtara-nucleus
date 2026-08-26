/**
 * logTelemetry.ts
 *
 * RPC wrapper for logging telemetry.
 */

import { supabase } from "../supabaseClient";

export async function logTelemetry(log: any) {
  const { error } = await supabase.rpc("rpc_log_telemetry", {
    log
  });

  if (error) {
    throw new Error(`Failed to log telemetry: ${error.message}`);
  }
}
