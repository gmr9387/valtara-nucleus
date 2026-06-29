import { getCoreDbClient } from "@/lib/core/services/db";
import type { CoreAuditEventRow } from "@/lib/core/services/contracts";
import { assertEventPayloadMatchesContract } from "@/lib/core/services/event-contracts.service";
import { logTelemetryEvent } from "@/lib/telemetry";

export interface AppendAuditEventInput {
  orgId: string;
  actorId: string;
  eventKind: string;
  eventVersion: number;
  subjectType: string;
  subjectId?: string | null;
  payload: Record<string, unknown>;
  correlationId?: string | null;
}

export async function appendAuditEvent(args: AppendAuditEventInput): Promise<CoreAuditEventRow> {
  await assertEventPayloadMatchesContract({
    eventKind: args.eventKind,
    eventVersion: args.eventVersion,
    payload: args.payload,
  });

  const db = getCoreDbClient();

  const { data, error } = await db
    .from("core_audit_events")
    .insert({
      org_id: args.orgId,
      actor_id: args.actorId,
      event_kind: args.eventKind,
      event_version: args.eventVersion,
      subject_type: args.subjectType,
      subject_id: args.subjectId ?? null,
      payload: args.payload,
      correlation_id: args.correlationId ?? null,
    })
    .select("*")
    .single();

  if (error || !data) {
    await logTelemetryEvent({
      organization_id: args.orgId,
      module: "core.audit",
      event_type: "audit_write_failed",
      severity: "error",
      message: error?.message ?? "Unknown core audit write failure",
      correlation_id: args.correlationId ?? null,
      attributes: {
        event_kind: args.eventKind,
        event_version: args.eventVersion,
        subject_type: args.subjectType,
      },
    });

    throw error ?? new Error("Failed to append core audit event");
  }

  return data as CoreAuditEventRow;
}

export async function listCoreAuditEvents(args: {
  orgId: string;
  eventKind?: string;
  limit?: number;
}): Promise<CoreAuditEventRow[]> {
  const db = getCoreDbClient();
  const limit = args.limit ?? 100;

  let query = db
    .from("core_audit_events")
    .select("*")
    .eq("org_id", args.orgId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (args.eventKind) query = query.eq("event_kind", args.eventKind);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as CoreAuditEventRow[];
}
