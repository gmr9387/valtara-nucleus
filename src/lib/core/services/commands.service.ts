import { getCoreDbClient } from "@/lib/core/services/db";
import type { CoreCommandRow } from "@/lib/core/services/contracts";

interface ExecuteIdempotentCommandArgs<TResult extends Record<string, unknown> | null> {
  orgId: string;
  actorId: string;
  commandType: string;
  idempotencyKey: string;
  payload: Record<string, unknown>;
  execute: () => Promise<TResult>;
}

interface ExecuteIdempotentCommandResult<TResult extends Record<string, unknown> | null> {
  command: CoreCommandRow;
  deduplicated: boolean;
  result: TResult | null;
}

async function loadExistingCommand(args: {
  orgId: string;
  commandType: string;
  idempotencyKey: string;
}): Promise<CoreCommandRow | null> {
  const db = getCoreDbClient();
  const { data, error } = await db
    .from("core_commands")
    .select("*")
    .eq("org_id", args.orgId)
    .eq("command_type", args.commandType)
    .eq("idempotency_key", args.idempotencyKey)
    .maybeSingle();

  if (error) throw error;
  return (data ?? null) as CoreCommandRow | null;
}

export async function executeIdempotentCommand<TResult extends Record<string, unknown> | null>(
  args: ExecuteIdempotentCommandArgs<TResult>,
): Promise<ExecuteIdempotentCommandResult<TResult>> {
  const db = getCoreDbClient();

  const { data: inserted, error: insertError } = await db
    .from("core_commands")
    .upsert(
      {
        org_id: args.orgId,
        actor_id: args.actorId,
        command_type: args.commandType,
        idempotency_key: args.idempotencyKey,
        payload: args.payload,
        status: "pending",
      },
      {
        onConflict: "org_id,command_type,idempotency_key",
        ignoreDuplicates: true,
      },
    )
    .select("*")
    .maybeSingle();

  if (insertError) throw insertError;

  if (!inserted) {
    const existing = await loadExistingCommand({
      orgId: args.orgId,
      commandType: args.commandType,
      idempotencyKey: args.idempotencyKey,
    });

    if (!existing) {
      throw new Error("Idempotent command already exists but could not be loaded");
    }

    if (existing.status === "pending") {
      throw new Error(
        `Idempotent command ${existing.command_id} is already in progress for this key`,
      );
    }

    return {
      command: existing,
      deduplicated: true,
      result: (existing.result ?? null) as TResult | null,
    };
  }

  const insertedCommand = inserted as CoreCommandRow;

  try {
    const result = await args.execute();

    const { data: completed, error: completeError } = await db
      .from("core_commands")
      .update({
        status: "completed",
        result: (result ?? null) as Record<string, unknown> | null,
        completed_at: new Date().toISOString(),
      })
      .eq("command_id", insertedCommand.command_id)
      .select("*")
      .single();

    if (completeError || !completed) {
      throw completeError ?? new Error("Failed to complete idempotent command");
    }

    return {
      command: completed as CoreCommandRow,
      deduplicated: false,
      result,
    };
  } catch (error) {
    await db
      .from("core_commands")
      .update({
        status: "failed",
        result: {
          error: error instanceof Error ? error.message : String(error),
        },
        completed_at: new Date().toISOString(),
      })
      .eq("command_id", insertedCommand.command_id);

    throw error;
  }
}
