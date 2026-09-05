// Phase 49 — Deployment Providers

import { startDashboard } from "../dashboard/startDashboard";
import { apiServer } from "../api/apiServer"; // your existing API server
import { osGuardian } from "../subsystems/guardian/osGuardian"; // your OS Guardian project
import { supabaseClient } from "../resources/supabaseClient"; // your Supabase client

export const deploymentProviders = {
  supabase: async () => {
    await supabaseClient.initialize();
    return "supabase";
  },

  apiServer: async () => {
    await apiServer.start();
    return "apiServer";
  },

  osGuardian: async () => {
    await osGuardian.initialize();
    return "osGuardian";
  },

  dashboard: async () => {
    await startDashboard();
    return "dashboard";
  },
};
