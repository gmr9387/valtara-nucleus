/**
 * Telemetry contracts for the Valtaris ecosystem.
 * These contracts define events, metrics, traces, and replay
 * metadata used across all runtimes for observability and
 * deterministic debugging.
 */

export interface TelemetryEvent {
  id: string;
  source: string; // workflow, decision, reimbursement, connector
  type: string; // start, step, complete, error
  timestamp: string;
  metadata: Record<string, unknown>;
}

export interface TelemetryMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  recordedAt: string;
  metadata: Record<string, unknown>;
}

export interface TelemetryTraceStep {
  id: string;
  traceId: string;
  step: string;
  timestamp: string;
  metadata: Record<string, unknown>;
}

export interface TelemetryTrace {
  id: string;
  source: string;
  startedAt: string;
  completedAt: string | null;
  steps: TelemetryTraceStep[];
  metadata: Record<string, unknown>;
}

export interface ReplayMetadata {
  id: string;
  source: string;
  runId: string;
  createdAt: string;
  metadata: Record<string, unknown>;
}
