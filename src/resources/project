/**
 * Project resource contracts for the Valtaris ecosystem.
 * These contracts define project structure, membership,
 * roles, and metadata used across the control plane.
 */

export interface Project {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  createdAt: string;
  createdBy: string;
  metadata: Record<string, unknown>;
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: "owner" | "admin" | "member";
  joinedAt: string;
  metadata: Record<string, unknown>;
}

export interface ProjectRoleAssignment {
  id: string;
  projectId: string;
  userId: string;
  role: string;
  assignedAt: string;
  metadata: Record<string, unknown>;
}

export interface ProjectEvent {
  id: string;
  projectId: string;
  type: "created" | "updated" | "member_added" | "member_removed" | "role_changed" | "error";
  timestamp: string;
  metadata: Record<string, unknown>;
}
