import { supabase } from "@/integrations/supabase/client";
import type { EnvironmentRow } from "@/lib/queries";

export async function listEnvironmentsByOrg(orgId: string): Promise<EnvironmentRow[]> {
  const { data: projects, error: projectsError } = await supabase
    .from("projects")
    .select("id")
    .eq("organization_id", orgId);

  if (projectsError) throw projectsError;

  const projectIds = (projects ?? []).map((project) => project.id);
  if (projectIds.length === 0) return [];

  const { data, error } = await supabase
    .from("environments")
    .select("id, project_id, name, env_type, created_by, created_at")
    .in("project_id", projectIds)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as EnvironmentRow[];
}
