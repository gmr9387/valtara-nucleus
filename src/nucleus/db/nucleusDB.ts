// src/nucleus/db/nucleusDB.ts
// Constitutional Nucleus DB Client Factory

import { createClient } from "@supabase/supabase-js";

export function createNucleusClient() {
  const url = import.meta.env.VITE_NUCLEUS_SUPABASE_URL!;
  const key = import.meta.env.VITE_NUCLEUS_SUPABASE_ANON_KEY!;

  return createClient(url, key);
}
