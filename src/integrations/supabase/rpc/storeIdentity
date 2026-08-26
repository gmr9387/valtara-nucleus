/**
 * storeIdentity.ts
 *
 * RPC wrapper for storing Nucleus identity.
 */

import { supabase } from "../supabaseClient";
import { NucleusIdentity } from "../../identityBinding";

export async function storeIdentity(identity: NucleusIdentity) {
  const { error } = await supabase.rpc("rpc_store_identity", {
    identity
  });

  if (error) {
    throw new Error(`Failed to store identity: ${error.message}`);
  }
}
