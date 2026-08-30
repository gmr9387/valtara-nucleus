/**
 * nucleusMetrics.ts
 *
 * Swap 42: Unified Subsystem Metrics Layer
 *
 * Computes cross-subsystem metrics for Nucleus.
 */

import { supabase } from "./supabase/supabaseClient";

export const nucleusMetrics = {
  async countEvents() {
    const { count } = await supabase
      .from("nucleus_events")
      .select("*", { count: "exact", head: true });

    return count ?? 0;
  },

  async countErrors() {
    const { count } = await supabase
      .from("nucleus_errors")
      .select("*", { count: "exact", head: true });

    return count ?? 0;
  },

  async countTelemetry() {
    const { count } = await supabase
      .from("nucleus_telemetry")
      .select("*", { count: "exact", head: true });

    return count ?? 0;
  },

  async countSubsystems() {
    const { count } = await supabase
      .from("nucleus_subsystems")
      .select("*", { count: "exact", head: true });

    return count ?? 0;
  },

  async getEventTypeBreakdown() {
    const { data } = await supabase.rpc("rpc_event_type_breakdown");
    return data ?? {};
  }
};
