import type { AppRole } from "@/lib/queries";
import { getMembership } from "@/lib/core/services/memberships.service";

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
const PERMISSION_KEYS = Object.keys(RULES) as Permission[];

export function roleHasPermission(
  role: AppRole | null | undefined,
  permission: Permission,
): boolean {
  if (!role) return false;
  return RULES[permission].includes(role);
}

export async function actorHasPermission(args: {
  orgId: string;
  userId: string;
  permission: Permission;
}): Promise<boolean> {
  const membership = await getMembership({ orgId: args.orgId, userId: args.userId });
  return roleHasPermission(membership?.role, args.permission);
}

export function listRolePermissions(role: AppRole | null | undefined): Permission[] {
  if (!role) return [];
  return PERMISSION_KEYS.filter((permission) => RULES[permission].includes(role));
}
