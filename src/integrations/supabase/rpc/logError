/**
 * logError.ts
 *
 * RPC wrapper for logging Nucleus errors.
 */

import { supabase } from "../supabaseClient";

export async function logError(err: any) {
  const { error } = await supabase.rpc("rpc_log_error", {
    err
  });

  if (error) {
    throw new Error(`Failed to log error: ${error.message}`);
  }
}
