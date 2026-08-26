/**
 * errorStore.ts
 *
 * Supabase binding for Nucleus error model.
 */

import { supabase } from "./supabaseClient";

export async function storeError(error: any) {
  return await supabase.from("nucleus_errors").insert({
    id: error.id,
    subsystem: error.subsystem,
    code: error.code,
    message: error.message,
    context: error.context,
    timestamp: error.timestamp
  });
}
