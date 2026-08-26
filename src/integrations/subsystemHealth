/**
 * subsystemHealth.ts
 *
 * Unified Subsystem Health Module
 *
 * This module provides a unified health interface for all subsystems:
 * - Glue
 * - Decision Weaver
 * - Guardian
 * - DualPay
 *
 * Nucleus uses this to monitor the entire ecosystem.
 */

import { NucleusTelemetryReporter, createLog, telemetryReporter } from "./telemetry";

export type Subsystem =
  | "glue"
  | "decision-weaver"
  | "guardian"
  | "dualpay";

export type SubsystemHealthStatus =
  | "healthy"
  | "degraded"
  | "unhealthy";

export interface SubsystemHealthReport {
  subsystem: Subsystem;
  status: SubsystemHealthStatus;
  timestamp: string;
  metadata?: Record<string, any>;
}

/**
 * Health Providers
 *
 * Placeholder implementations.
 *
 * Later swaps will:
 * - bind to real subsystem health endpoints
 * - bind to Supabase health tables
 * - bind to runtime health checks
 */

const glueHealthProvider = async (): Promise<SubsystemHealthReport> => ({
  subsystem: "glue",
  status: "healthy",
  timestamp: new Date().toISOString(),
  metadata: { workflowEngine: "ok" }
});

const decisionWeaverHealthProvider = async (): Promise<SubsystemHealthReport> => ({
  subsystem: "decision-weaver",
  status: "healthy",
  timestamp: new Date().toISOString(),
  metadata: { ruleEngine: "ok" }
});

const guardianHealthProvider = async (): Promise<SubsystemHealthReport> => ({
  subsystem: "guardian",
  status: "healthy",
  timestamp: new Date().toISOString(),
  metadata: { governanceEngine: "ok" }
});

const dualPayHealthProvider = async (): Promise<SubsystemHealthReport> => ({
  subsystem: "dualpay",
  status: "healthy",
  timestamp: new Date().toISOString(),
  metadata: { ledgerEngine: "ok" }
});

/**
 * Unified Health Interface
 */

export interface SubsystemHealthInterface {
  getHealth(subsystem: Subsystem): Promise<SubsystemHealthReport>;
  getAllHealth(): Promise<SubsystemHealthReport[]>;
}

/**
 * Implementation
 */

export const subsystemHealth: SubsystemHealthInterface = {
  async getHealth(subsystem) {
    telemetryReporter.log(
      createLog("nucleus", "info", "Subsystem health check", { subsystem })
    );

    switch (subsystem) {
      case "glue":
        return await glueHealthProvider();
      case "decision-weaver":
        return await decisionWeaverHealthProvider();
      case "guardian":
        return await guardianHealthProvider();
      case "dualpay":
        return await dualPayHealthProvider();
      default:
        return {
          subsystem,
          status: "unhealthy",
          timestamp: new Date().toISOString(),
          metadata: { error: "Unknown subsystem" }
        };
    }
  },

  async getAllHealth() {
    telemetryReporter.log(
      createLog("nucleus", "info", "Full ecosystem health check")
    );

    return Promise.all([
      glueHealthProvider(),
      decisionWeaverHealthProvider(),
      guardianHealthProvider(),
      dualPayHealthProvider()
    ]);
  }
};
