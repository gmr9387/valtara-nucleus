/**
 * nucleusDashboard.ts
 *
 * Swap 41: Unified Subsystem Dashboard API
 *
 * Aggregates subsystem health, telemetry, errors, and events
 * into a single dashboard API for Nucleus.
 */

import { supabase } from "./supabase/supabaseClient";

export const nucleusDashboard = {
  async getSubsystemOverview() {
    const { data: subsystems } = await supabase
      .from("nucleus_subsystems")
      .select("*");

    return subsystems ?? [];
  },

  async getRecentEvents(limit = 50) {
    const { data: events } = await supabase
      .from("nucleus_events")
      .select("*")
      .order("timestamp", { ascending: false })
      .limit(limit);

    return events ?? [];
  },

  async getRecentErrors(limit = 50) {
    const { data: errors } = await supabase
      .from("nucleus_errors")
      .select("*")
      .order("timestamp", { ascending: false })
      .limit(limit);

    return errors ?? [];
  },

  async getRecentTelemetry(limit = 50) {
    const { data: telemetry } = await supabase
      .from("nucleus_telemetry")
      .select("*")
      .order("timestamp", { ascending: false })
      .limit(limit);

    return telemetry ?? [];
  }
};
