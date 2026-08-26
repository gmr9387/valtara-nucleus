/**
 * registerSubsystem.ts
 *
 * RPC wrapper for registering subsystem metadata.
 */

import { supabase } from "../supabaseClient";

export async function registerSubsystem(reg: any) {
  const { error } = await supabase.rpc("rpc_register_subsystem", {
    reg
  });

  if (error) {
    throw new Error(`Failed to register subsystem: ${error.message}`);
  }
}
