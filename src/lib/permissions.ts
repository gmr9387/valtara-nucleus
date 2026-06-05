import type { AppRole } from "@/lib/queries";
import { useMyOrgMembership } from "@/lib/queries";
import { useOrgStore } from "@/lib/org-store";

/**
 * Single source of truth for UI permission checks.
 * Mirrors the role rules enforced server-side by Supabase RLS.
 */
export type Permission =
  | "org:manage"
  | "org:delete"
  | "members:manage"
  | "projects:manage"
  | "environments:manage"
  | "secrets:manage"
  | "secrets:read"
  | "connectors:manage"
  | "connectors:read"
  | "audit:read"
  | "telemetry:read"
  | "workflows:read"
  | "workflows:create"
  | "workflows:update"
  | "workflows:publish"
  | "workflows:run"
  | "workflows:cancel"
  | "workflows:admin";

const RULES: Record<Permission, AppRole[]> = {
  "org:manage": ["owner", "admin"],
  "org:delete": ["owner"],
  "members:manage": ["owner", "admin"],
  "projects:manage": ["owner", "admin", "manager"],
  "environments:manage": ["owner", "admin", "manager"],
  "secrets:manage": ["owner", "admin"],
  "secrets:read": ["owner", "admin", "manager"],
  "connectors:manage": ["owner", "admin"],
  "connectors:read": ["owner", "admin", "manager", "operator", "viewer"],
  "audit:read": ["owner", "admin", "manager", "operator", "viewer"],
  "telemetry:read": ["owner", "admin", "manager", "operator", "viewer"],
  "workflows:read": ["owner", "admin", "manager", "operator", "viewer"],
  "workflows:create": ["owner", "admin", "manager"],
  "workflows:update": ["owner", "admin", "manager"],
  "workflows:publish": ["owner", "admin"],
  "workflows:run": ["owner", "admin", "manager", "operator"],
  "workflows:cancel": ["owner", "admin", "manager", "operator"],
  "workflows:admin": ["owner", "admin"],
};

export function roleHas(role: AppRole | null | undefined, perm: Permission): boolean {
  if (!role) return false;
  return RULES[perm].includes(role);
}

export interface Permissions {
  role: AppRole | null;
  loading: boolean;
  can: (perm: Permission) => boolean;
  isViewer: boolean;
  isOwner: boolean;
}

export function usePermissions(): Permissions {
  const { currentOrgId } = useOrgStore();
  const membership = useMyOrgMembership(currentOrgId);
  const role = (membership.data?.role ?? null) as AppRole | null;

  return {
    role,
    loading: membership.isLoading,
    can: (perm) => roleHas(role, perm),
    isViewer: role === "viewer",
    isOwner: role === "owner",
  };
}
