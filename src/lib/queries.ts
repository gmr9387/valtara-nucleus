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

export interface ProfileSummary {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url?: string | null;
}

export interface MembershipRow {
  id: string;
  organization_id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
  profiles?: ProfileSummary | ProfileSummary[] | null;
}

export interface ProjectRow {
  id: string;
  organization_id: string;
  name: string;
  slug: string;
  description: string | null;
  status: "active" | "paused" | "archived";
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface EnvironmentRow {
  id: string;
  project_id: string;
  name: string;
  env_type: "development" | "staging" | "production";
  created_by: string;
  created_at: string;
  project_name?: string;
}

export interface AuditEventRow {
  id: string;
  organization_id: string | null;
  user_id: string | null;
  module: string;
  entity_type: string;
  entity_id: string | null;
  action: string;
  before_json: unknown | null;
  after_json: unknown | null;
  correlation_id: string | null;
  ip_address: string | null;
  created_at: string;
}

/**
 * Current user organizations.
 * RLS already limits this to orgs where the user is a member.
 */
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

      return (data ?? []) as Organization[];
    },
    staleTime: 30_000,
  });
}

/**
 * Single organization by id.
 */
export function useOrganization(orgId: string | null) {
  return useQuery({
    enabled: !!orgId,
    queryKey: ["organization", orgId],
    queryFn: async (): Promise<Organization | null> => {
      const { data, error } = await supabase
        .from("organizations")
        .select("*")
        .eq("id", orgId!)
        .maybeSingle();

      if (error) throw error;

      return (data ?? null) as Organization | null;
    },
    staleTime: 30_000,
  });
}

/**
 * Current user's membership for an org.
 * This becomes the lightweight role source for UI permission checks.
 */
export function useMyOrgMembership(orgId: string | null) {
  const { user } = useAuth();

  return useQuery({
    enabled: !!orgId && !!user,
    queryKey: ["my-org-membership", orgId, user?.id],
    queryFn: async (): Promise<MembershipRow | null> => {
      const { data, error } = await supabase
        .from("organization_members")
        .select("id, organization_id, user_id, role, created_at")
        .eq("organization_id", orgId!)
        .eq("user_id", user!.id)
        .maybeSingle();

      if (error) throw error;

      return (data ?? null) as MembershipRow | null;
    },
    staleTime: 30_000,
  });
}

/**
 * Organization members.
 * Attempts profile join first. Falls back to membership-only if Supabase
 * relationship aliases are not generated yet.
 */
export function useOrgMembers(orgId: string | null) {
  return useQuery({
    enabled: !!orgId,
    queryKey: ["org-members", orgId],
    queryFn: async (): Promise<MembershipRow[]> => {
      const joined = await supabase
        .from("organization_members")
        .select(
          "id, organization_id, user_id, role, created_at, profiles:profiles!organization_members_user_id_fkey(id, email, full_name, avatar_url)",
        )
        .eq("organization_id", orgId!)
        .order("created_at", { ascending: true });

      if (!joined.error) {
        return (joined.data ?? []) as MembershipRow[];
      }

      const fallback = await supabase
        .from("organization_members")
        .select("id, organization_id, user_id, role, created_at")
        .eq("organization_id", orgId!)
        .order("created_at", { ascending: true });

      if (fallback.error) throw fallback.error;

      return (fallback.data ?? []) as MembershipRow[];
    },
    staleTime: 30_000,
  });
}

/**
 * Projects for selected organization.
 */
export function useProjects(orgId: string | null) {
  return useQuery({
    enabled: !!orgId,
    queryKey: ["projects", orgId],
    queryFn: async (): Promise<ProjectRow[]> => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("organization_id", orgId!)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return (data ?? []) as ProjectRow[];
    },
    staleTime: 30_000,
  });
}

/**
 * Single project.
 */
export function useProject(projectId: string | null) {
  return useQuery({
    enabled: !!projectId,
    queryKey: ["project", projectId],
    queryFn: async (): Promise<ProjectRow | null> => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId!)
        .maybeSingle();

      if (error) throw error;

      return (data ?? null) as ProjectRow | null;
    },
    staleTime: 30_000,
  });
}

/**
 * Environments for all projects in selected organization.
 */
export function useEnvironments(orgId: string | null) {
  return useQuery({
    enabled: !!orgId,
    queryKey: ["envs", orgId],
    queryFn: async (): Promise<EnvironmentRow[]> => {
      const projects = await supabase
        .from("projects")
        .select("id, name")
        .eq("organization_id", orgId!);

      if (projects.error) throw projects.error;

      const projectRows = projects.data ?? [];
      const projectIds = projectRows.map((project) => project.id);

      if (projectIds.length === 0) return [];

      const envs = await supabase
        .from("environments")
        .select("*")
        .in("project_id", projectIds)
        .order("created_at", { ascending: false });

      if (envs.error) throw envs.error;

      const projectNameById = Object.fromEntries(
        projectRows.map((project) => [project.id, project.name]),
      );

      return (envs.data ?? []).map((env) => ({
        ...env,
        project_name: projectNameById[env.project_id],
      })) as EnvironmentRow[];
    },
    staleTime: 30_000,
  });
}

/**
 * Environments for one project.
 */
export function useProjectEnvironments(projectId: string | null) {
  return useQuery({
    enabled: !!projectId,
    queryKey: ["project-envs", projectId],
    queryFn: async (): Promise<EnvironmentRow[]> => {
      const { data, error } = await supabase
        .from("environments")
        .select("*")
        .eq("project_id", projectId!)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return (data ?? []) as EnvironmentRow[];
    },
    staleTime: 30_000,
  });
}

/**
 * Organization audit events.
 */
export function useAuditEvents(orgId: string | null, limit = 200) {
  return useQuery({
    enabled: !!orgId,
    queryKey: ["audit", orgId, limit],
    queryFn: async (): Promise<AuditEventRow[]> => {
      const { data, error } = await supabase
        .from("audit_events")
        .select("*")
        .eq("organization_id", orgId!)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data ?? []) as AuditEventRow[];
    },
    staleTime: 15_000,
  });
}

/**
 * Recent audit events across visible orgs.
 * RLS limits scope automatically.
 */
export function useRecentAuditEvents(limit = 100) {
  const { user } = useAuth();

  return useQuery({
    enabled: !!user,
    queryKey: ["audit-recent", user?.id, limit],
    queryFn: async (): Promise<AuditEventRow[]> => {
      const { data, error } = await supabase
        .from("audit_events")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data ?? []) as AuditEventRow[];
    },
    staleTime: 15_000,
  });
}

/**
 * Permission helpers for UI only.
 * Real enforcement still belongs to Supabase RLS.
 */
export function canManageOrg(role?: AppRole | null): boolean {
  return role === "owner" || role === "admin";
}

export function canManageProjects(role?: AppRole | null): boolean {
  return role === "owner" || role === "admin" || role === "manager";
}

export function canOperate(role?: AppRole | null): boolean {
  return role === "owner" || role === "admin" || role === "manager" || role === "operator";
}

export function isReadOnly(role?: AppRole | null): boolean {
  return role === "viewer";
}