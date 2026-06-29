import {
  logTelemetryEvent,
  logTelemetryMetric,
  logTelemetryTrace,
  type TelemetryEventPayload,
  type TelemetryMetricPayload,
  type TelemetryTracePayload,
} from "@/lib/telemetry";

export async function appendCoreTelemetryEvent(payload: TelemetryEventPayload): Promise<void> {
  await logTelemetryEvent(payload);
}

export async function appendCoreTelemetryMetric(payload: TelemetryMetricPayload): Promise<void> {
  await logTelemetryMetric(payload);
}

export async function appendCoreTelemetryTrace(payload: TelemetryTracePayload): Promise<void> {
  await logTelemetryTrace(payload);
}
