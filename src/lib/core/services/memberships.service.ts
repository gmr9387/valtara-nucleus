import { getCoreDbClient } from "@/lib/core/services/db";
import type { MembershipRow } from "@/lib/queries";

export async function getMembership(args: {
  orgId: string;
  userId: string;
}): Promise<MembershipRow | null> {
  const db = getCoreDbClient();

  const { data, error } = await db
    .from("organization_members")
    .select("id, organization_id, user_id, role, created_at")
    .eq("organization_id", args.orgId)
    .eq("user_id", args.userId)
    .maybeSingle();

  if (error) throw error;
  return (data ?? null) as MembershipRow | null;
}

export async function listMemberships(orgId: string): Promise<MembershipRow[]> {
  const db = getCoreDbClient();

  const { data, error } = await db
    .from("organization_members")
    .select("id, organization_id, user_id, role, created_at")
    .eq("organization_id", orgId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as MembershipRow[];
}
