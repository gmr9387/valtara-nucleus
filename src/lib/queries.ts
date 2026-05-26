import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";

export type AppRole = "owner" | "admin" | "manager" | "operator" | "viewer";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  status: "active" | "suspended" | "archived";
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface MembershipRow {
  id: string;
  organization_id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

export function useMyOrganizations() {
  const { user } = useAuth();
  return useQuery({
    enabled: !!user,
    queryKey: ["my-orgs", user?.id],
    queryFn: async (): Promise<Organization[]> => {
      const { data, error } = await supabase
        .from("organizations")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as Organization[];
    },
  });
}

export function useOrgMembers(orgId: string | null) {
  return useQuery({
    enabled: !!orgId,
    queryKey: ["org-members", orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("organization_members")
        .select("id, organization_id, user_id, role, created_at, profiles:profiles!organization_members_user_id_fkey(id, email, full_name)")
        .eq("organization_id", orgId!)
        .order("created_at", { ascending: true });
      if (error) {
        // Fallback without join if FK alias not detected
        const fallback = await supabase
          .from("organization_members")
          .select("id, organization_id, user_id, role, created_at")
          .eq("organization_id", orgId!);
        if (fallback.error) throw fallback.error;
        return fallback.data as MembershipRow[];
      }
      return data as MembershipRow[];
    },
  });
}

export function useProjects(orgId: string | null) {
  return useQuery({
    enabled: !!orgId,
    queryKey: ["projects", orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("organization_id", orgId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useEnvironments(orgId: string | null) {
  return useQuery({
    enabled: !!orgId,
    queryKey: ["envs", orgId],
    queryFn: async () => {
      const projects = await supabase.from("projects").select("id, name").eq("organization_id", orgId!);
      if (projects.error) throw projects.error;
      const ids = (projects.data ?? []).map((p) => p.id);
      if (ids.length === 0) return [];
      const envs = await supabase.from("environments").select("*").in("project_id", ids).order("created_at", { ascending: false });
      if (envs.error) throw envs.error;
      const byId = Object.fromEntries(projects.data!.map((p) => [p.id, p.name]));
      return envs.data!.map((e) => ({ ...e, project_name: byId[e.project_id] }));
    },
  });
}

export function useAuditEvents(orgId: string | null) {
  return useQuery({
    enabled: !!orgId,
    queryKey: ["audit", orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("audit_events")
        .select("*")
        .eq("organization_id", orgId!)
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data;
    },
  });
}
