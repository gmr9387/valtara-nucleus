import { getCoreDbClient } from "@/lib/core/services/db";
import type {
  CoreContractCompatibility,
  CoreEventContractRow,
  EventPayloadContractSchema,
} from "@/lib/core/services/contracts";
import { validateEventPayloadSchema } from "@/lib/core/services/event-schema";

export interface RegisterEventContractInput {
  eventKind: string;
  version: number;
  schema: EventPayloadContractSchema;
  compatibilityStatus?: CoreContractCompatibility;
  registeredBy: string;
}

export async function registerEventContract(
  input: RegisterEventContractInput,
): Promise<CoreEventContractRow> {
  const db = getCoreDbClient();
  const { data, error } = await db
    .from("core_event_contracts")
    .insert({
      event_kind: input.eventKind,
      version: input.version,
      schema_json: input.schema,
      compatibility_status: input.compatibilityStatus ?? "compatible",
      registered_by: input.registeredBy,
    })
    .select("*")
    .single();

  if (error || !data) throw error ?? new Error("Failed to register event contract");
  return data as CoreEventContractRow;
}

export async function getEventContract(
  eventKind: string,
  version: number,
): Promise<CoreEventContractRow | null> {
  const db = getCoreDbClient();
  const { data, error } = await db
    .from("core_event_contracts")
    .select("*")
    .eq("event_kind", eventKind)
    .eq("version", version)
    .maybeSingle();

  if (error) throw error;
  return (data ?? null) as CoreEventContractRow | null;
}

export async function listEventContracts(args?: {
  eventKind?: string;
  compatibilityStatus?: CoreContractCompatibility;
}): Promise<CoreEventContractRow[]> {
  const db = getCoreDbClient();
  let query = db.from("core_event_contracts").select("*").order("created_at", { ascending: false });

  if (args?.eventKind) query = query.eq("event_kind", args.eventKind);
  if (args?.compatibilityStatus) query = query.eq("compatibility_status", args.compatibilityStatus);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as CoreEventContractRow[];
}

export async function assertEventPayloadMatchesContract(args: {
  eventKind: string;
  eventVersion: number;
  payload: unknown;
}): Promise<CoreEventContractRow> {
  const contract = await getEventContract(args.eventKind, args.eventVersion);
  if (!contract) {
    throw new Error(`Missing event contract for ${args.eventKind}@v${String(args.eventVersion)}`);
  }

  const result = validateEventPayloadSchema(contract.schema_json, args.payload);
  if (!result.valid) {
    throw new Error(
      `Payload schema validation failed for ${args.eventKind}@v${String(args.eventVersion)}: ${result.errors.join("; ")}`,
    );
  }

  return contract;
}
