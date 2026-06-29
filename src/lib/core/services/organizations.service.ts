import { supabase } from "@/integrations/supabase/client";
import type { Organization } from "@/lib/queries";

export async function listOrganizations(): Promise<Organization[]> {
  const { data, error } = await supabase
    .from("organizations")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as Organization[];
}

export async function getOrganization(orgId: string): Promise<Organization | null> {
  const { data, error } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", orgId)
    .maybeSingle();

  if (error) throw error;
  return (data ?? null) as Organization | null;
}
