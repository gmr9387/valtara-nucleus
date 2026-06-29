import { supabase } from "@/integrations/supabase/client";

export interface UntypedDbClient {
  from: (table: string) => unknown;
}

export function getCoreDbClient(): UntypedDbClient {
  return supabase as unknown as UntypedDbClient;
}
