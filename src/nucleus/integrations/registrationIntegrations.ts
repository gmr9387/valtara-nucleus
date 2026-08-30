// src/nucleus/integrations/registerIntegrations.ts

import { registerIntegration } from "./integrationLoader";
import { createSupabaseClient } from "../supabase/client"; // adjust path if needed

export function registerAllIntegrations() {
  registerIntegration({
    name: "supabase",
    clientFactory: (organizationId: string) =>
      createSupabaseClient(organizationId)
  });

  // Add more integrations here as needed
}
