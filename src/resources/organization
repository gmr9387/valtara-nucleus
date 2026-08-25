/**
 * Organization resource contracts for the Valtaris ecosystem.
 * These contracts define the structure of organizations,
 * membership, roles, and metadata used across the control plane.
 */

export interface Organization {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  createdBy: string;
  metadata: Record<string, unknown>;
}

export interface OrganizationMember {
  id: string;
  organizationId: string;
  userId: string;
  role: "owner" | "admin" | "member";
  joinedAt: string;
  metadata: Record<string, unknown>;
}

export interface OrganizationRoleAssignment {
  id: string;
  organizationId: string;
  userId: string;
  role: string;
  assignedAt: string;
  metadata: Record<string, unknown>;
}

export interface OrganizationEvent {
  id: string;
  organizationId: string;
  type: "created" | "updated" | "member_added" | "member_removed" | "role_changed" | "error";
  timestamp: string;
  metadata: Record<string, unknown>;
}
