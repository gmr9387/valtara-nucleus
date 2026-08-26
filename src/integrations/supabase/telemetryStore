/**
 * telemetryStore.ts
 *
 * Supabase binding for Nucleus telemetry.
 */

import { supabase } from "./supabaseClient";

export async function storeTelemetry(log: any) {
  return await supabase.from("nucleus_telemetry").insert({
    id: log.id,
    subsystem: log.subsystem,
    level: log.level,
    message: log.message,
    metadata: log.metadata,
    timestamp: log.timestamp
  });
}
