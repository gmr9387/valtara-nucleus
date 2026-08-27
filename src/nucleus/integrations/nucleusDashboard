// src/nucleus/integrations/nucleusDashboardApi.ts

/**
 * Nucleus Dashboard API
 *
 * Constitutional role:
 * Nucleus = KNOW
 *
 * This integration exposes:
 *   - subsystem health
 *   - telemetry summaries
 *   - metrics snapshots
 *
 * It provides a clean JSON interface for:
 *   - UI dashboards
 *   - developer tools
 *   - external monitoring systems
 *
 * No execution.
 * No authorization.
 * No domain logic.
 */

import { getEcosystemState } from "../state/nucleusState";
import { getMetricsSnapshot } from "./nucleusMetrics";

export function getDashboardSnapshot() {
  const ecosystem = getEcosystemState();
  const metrics = getMetricsSnapshot();

  return {
    timestamp: Date.now(),
    subsystemHealth: ecosystem.subsystemHealth,
    lastEvent: ecosystem.lastEvent,
    metrics,
  };
}

/**
 * Optional: HTTP-style handler for frameworks
 *
 * Example usage:
 *   const data = await dashboardHandler();
 *   return Response.json(data);
 */
export async function dashboardHandler() {
  return getDashboardSnapshot();
}
