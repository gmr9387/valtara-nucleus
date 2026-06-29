import { appendAuditEvent } from "@/lib/core/services/audit-events.service";
import { executeIdempotentCommand } from "@/lib/core/services/commands.service";

export async function dualPayExampleCall(args: {
  orgId: string;
  actorId: string;
  idempotencyKey: string;
  payoutId: string;
}) {
  const command = await executeIdempotentCommand({
    orgId: args.orgId,
    actorId: args.actorId,
    commandType: "dualpay.payout.requested",
    idempotencyKey: args.idempotencyKey,
    payload: { payoutId: args.payoutId },
    execute: async () => ({ accepted: true, payoutId: args.payoutId }),
  });

  await appendAuditEvent({
    orgId: args.orgId,
    actorId: args.actorId,
    eventKind: "dualpay.payout.requested",
    eventVersion: 1,
    subjectType: "payout",
    subjectId: args.payoutId,
    payload: { commandId: command.command.command_id, deduplicated: command.deduplicated },
    correlationId: crypto.randomUUID(),
  });

  return command;
}

export async function guardianExampleCall(args: {
  orgId: string;
  actorId: string;
  idempotencyKey: string;
  alertId: string;
}) {
  const command = await executeIdempotentCommand({
    orgId: args.orgId,
    actorId: args.actorId,
    commandType: "guardian.alert.reviewed",
    idempotencyKey: args.idempotencyKey,
    payload: { alertId: args.alertId },
    execute: async () => ({ reviewed: true, alertId: args.alertId }),
  });

  await appendAuditEvent({
    orgId: args.orgId,
    actorId: args.actorId,
    eventKind: "guardian.alert.reviewed",
    eventVersion: 1,
    subjectType: "alert",
    subjectId: args.alertId,
    payload: { commandId: command.command.command_id, deduplicated: command.deduplicated },
    correlationId: crypto.randomUUID(),
  });

  return command;
}
