import type { ReactNode } from "react";
import { usePermissions, type Permission } from "@/lib/permissions";

/**
 * Render children only when the current user has the given permission
 * within the active organization. Frontend convenience; server-side RLS
 * remains the source of truth.
 */
export function PermissionGate({
  permission,
  fallback = null,
  children,
}: {
  permission: Permission;
  fallback?: ReactNode;
  children: ReactNode;
}) {
  const { can, loading } = usePermissions();
  if (loading) return null;
  if (!can(permission)) return <>{fallback}</>;
  return <>{children}</>;
}
