import { supabase } from "@/integrations/supabase/client";

export type TelemetrySeverity = "debug" | "info" | "warn" | "error" | "critical";
export type SpanStatus = "ok" | "error" | "cancelled" | "unset";

export interface TelemetryEventPayload {
  organization_id?: string | null;
  module: string;
  event_type: string;
  severity?: TelemetrySeverity;
  trace_id?: string | null;
  span_id?: string | null;
  correlation_id?: string | null;
  message?: string | null;
  attributes?: Record<string, unknown> | null;
}

export interface TelemetryMetricPayload {
  organization_id?: string | null;
  module: string;
  metric_name: string;
  metric_value: number;
  unit?: string | null;
  attributes?: Record<string, unknown> | null;
}

export interface TelemetryTracePayload {
  organization_id?: string | null;
  trace_id: string;
  span_id: string;
  parent_span_id?: string | null;
  name: string;
  started_at: string;
  ended_at?: string | null;
  duration_ms?: number | null;
  status?: SpanStatus;
  attributes?: Record<string, unknown> | null;
}

export function createTraceId(): string {
  return crypto.randomUUID();
}

export function createSpanId(): string {
  return crypto.randomUUID();
}

async function currentUserId(): Promise<string | null> {
  try {
    const { data } = await supabase.auth.getUser();
    return data.user?.id ?? null;
  } catch {
    return null;
  }
}

/**
 * Append-only telemetry event. Best-effort — never throws into caller.
 */
export async function logTelemetryEvent(payload: TelemetryEventPayload): Promise<void> {
  try {
    const userId = await currentUserId();
    if (!userId) return;

    const { error } = await supabase.from("telemetry_events").insert({
      organization_id: payload.organization_id ?? null,
      user_id: userId,
      module: payload.module,
      event_type: payload.event_type,
      severity: payload.severity ?? "info",
      trace_id: payload.trace_id ?? null,
      span_id: payload.span_id ?? null,
      correlation_id: payload.correlation_id ?? null,
      message: payload.message ?? null,
      attributes_json: (payload.attributes ?? null) as never,
    });

    if (error && import.meta.env.DEV) {
      console.warn("[telemetry] event insert failed", error.message);
    }
  } catch (error) {
    if (import.meta.env.DEV) console.warn("[telemetry] event failure", error);
  }
}

export async function logTelemetryMetric(payload: TelemetryMetricPayload): Promise<void> {
  try {
    const userId = await currentUserId();
    if (!userId) return;

    const { error } = await supabase.from("telemetry_metrics").insert({
      organization_id: payload.organization_id ?? null,
      user_id: userId,
      module: payload.module,
      metric_name: payload.metric_name,
      metric_value: payload.metric_value,
      unit: payload.unit ?? null,
      attributes_json: (payload.attributes ?? null) as never,
    });

    if (error && import.meta.env.DEV) {
      console.warn("[telemetry] metric insert failed", error.message);
    }
  } catch (error) {
    if (import.meta.env.DEV) console.warn("[telemetry] metric failure", error);
  }
}

export async function logTelemetryTrace(payload: TelemetryTracePayload): Promise<void> {
  try {
    const userId = await currentUserId();
    if (!userId) return;

    const { error } = await supabase.from("telemetry_traces").insert({
      organization_id: payload.organization_id ?? null,
      user_id: userId,
      trace_id: payload.trace_id,
      span_id: payload.span_id,
      parent_span_id: payload.parent_span_id ?? null,
      name: payload.name,
      started_at: payload.started_at,
      ended_at: payload.ended_at ?? null,
      duration_ms: payload.duration_ms ?? null,
      status: payload.status ?? "unset",
      attributes_json: (payload.attributes ?? null) as never,
    });

    if (error && import.meta.env.DEV) {
      console.warn("[telemetry] trace insert failed", error.message);
    }
  } catch (error) {
    if (import.meta.env.DEV) console.warn("[telemetry] trace failure", error);
  }
}

/**
 * Convenience: time an async operation and emit a trace + completion event.
 */
export async function withSpan<T>(
  args: {
    name: string;
    organization_id?: string | null;
    module: string;
    trace_id?: string;
    parent_span_id?: string | null;
    attributes?: Record<string, unknown>;
  },
  fn: () => Promise<T>,
): Promise<T> {
  const trace_id = args.trace_id ?? createTraceId();
  const span_id = createSpanId();
  const started = new Date();

  try {
    const result = await fn();
    const ended = new Date();
    void logTelemetryTrace({
      organization_id: args.organization_id ?? null,
      trace_id,
      span_id,
      parent_span_id: args.parent_span_id ?? null,
      name: args.name,
      started_at: started.toISOString(),
      ended_at: ended.toISOString(),
      duration_ms: ended.getTime() - started.getTime(),
      status: "ok",
      attributes: args.attributes,
    });
    return result;
  } catch (error) {
    const ended = new Date();
    void logTelemetryTrace({
      organization_id: args.organization_id ?? null,
      trace_id,
      span_id,
      parent_span_id: args.parent_span_id ?? null,
      name: args.name,
      started_at: started.toISOString(),
      ended_at: ended.toISOString(),
      duration_ms: ended.getTime() - started.getTime(),
      status: "error",
      attributes: { ...(args.attributes ?? {}), error: String(error) },
    });
    void logTelemetryEvent({
      organization_id: args.organization_id ?? null,
      module: args.module,
      event_type: "span.error",
      severity: "error",
      trace_id,
      span_id,
      message: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}
