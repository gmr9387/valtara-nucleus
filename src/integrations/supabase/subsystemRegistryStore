/**
 * subsystemRegistryStore.ts
 *
 * Supabase binding for Nucleus subsystem registry.
 */

import { supabase } from "./supabaseClient";

export async function storeSubsystemRegistration(reg: any) {
  return await supabase.from("nucleus_subsystems").insert({
    id: reg.id,
    runtime: reg.runtime ? true : false,
    definition: reg.definition ? true : false,
    health: reg.health ? true : false,
    telemetry: reg.telemetry ? true : false,
    events: reg.events ? true : false,
    contracts: reg.contracts ? true : false,
    timestamp: new Date().toISOString()
  });
}
