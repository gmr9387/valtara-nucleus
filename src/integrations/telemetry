/**
 * telemetry.ts
 *
 * Nucleus Telemetry Model Specification
 *
 * Defines the unified telemetry model for the entire Valtaris ecosystem.
 * All arms (Glue, Decision Weaver, Guardian, DualPay) must use this model
 * when reporting logs, metrics, traces, or subsystem health.
 */

export type NucleusTelemetrySource =
  | "nucleus"
  | "glue"
  | "decision-weaver"
  | "guardian"
  | "dualpay";

export type NucleusLogLevel =
  | "debug"
  | "info"
  | "warn"
  | "error"
  | "critical";

export interface NucleusLogEntry {
  id: string;
  timestamp: string;
  source: NucleusTelemetrySource;
  level: NucleusLogLevel;
  message: string;
  metadata?: Record<string, any>;
}

export interface NucleusMetric {
  name: string;
  value: number;
  unit?: string;
  source: NucleusTelemetrySource;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface NucleusTraceSpan {
  id: string;
  source: NucleusTelemetrySource;
  operation: string;
  startTime: string;
  endTime?: string;
  metadata?: Record<string, any>;
}

export interface NucleusSubsystemHealth {
  source: NucleusTelemetrySource;
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  details?: Record<string, any>;
}

/**
 * Telemetry Reporter Interface
 */

export interface NucleusTelemetryReporter {
  log(entry: NucleusLogEntry): Promise<void>;
  metric(metric: NucleusMetric): Promise<void>;
  trace(span: NucleusTraceSpan): Promise<void>;
  health(status: NucleusSubsystemHealth): Promise<void>;
}

/**
 * Default stub implementation.
 *
 * Later swaps will:
 * - write logs to Supabase
 * - write metrics to Supabase
 * - write traces to Supabase
 * - expose health endpoints
 */

export const telemetryReporter: NucleusTelemetryReporter = {
  async log(entry) {
    console.log("[NUCLEUS LOG]", entry);
  },

  async metric(metric) {
    console.log("[NUCLEUS METRIC]", metric);
  },

  async trace(span) {
    console.log("[NUCLEUS TRACE]", span);
  },

  async health(status) {
    console.log("[NUCLEUS HEALTH]", status);
  }
};

/**
 * Helper functions
 */

export function createLog(
  source: NucleusTelemetrySource,
  level: NucleusLogLevel,
  message: string,
  metadata?: Record<string, any>
): NucleusLogEntry {
  return {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    source,
    level,
    message,
    metadata
  };
}

export function createMetric(
  name: string,
  value: number,
  source: NucleusTelemetrySource,
  unit?: string,
  metadata?: Record<string, any>
): NucleusMetric {
  return {
    name,
    value,
    unit,
    source,
    timestamp: new Date().toISOString(),
    metadata
  };
}

export function createTraceSpan(
  source: NucleusTelemetrySource,
  operation: string,
  metadata?: Record<string, any>
): NucleusTraceSpan {
  return {
    id: crypto.randomUUID(),
    source,
    operation,
    startTime: new Date().toISOString(),
    metadata
  };
}
