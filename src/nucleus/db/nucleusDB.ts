// src/nucleus/db/nucleusDB.ts
// Full file swap — Nucleus Supabase client

import { createClient, SupabaseClient } from "@supabase/supabase-js";

export class NucleusDB {
  private client: SupabaseClient;

  constructor() {
    const url = process.env.VITE_NUCLEUS_SUPABASE_URL;
    const serviceRole = process.env.NUCLEUS_SUPABASE_SERVICE_ROLE_KEY;

    if (!url) {
      throw new Error("Missing VITE_NUCLEUS_SUPABASE_URL");
    }
    if (!serviceRole) {
      throw new Error("Missing NUCLEUS_SUPABASE_SERVICE_ROLE_KEY");
    }

    this.client = createClient(url, serviceRole, {
      auth: { persistSession: false },
    });
  }

  getClient() {
    return this.client;
  }
}
