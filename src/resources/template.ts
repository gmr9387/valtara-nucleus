/**
 * Template resource contracts for the Valtaris ecosystem.
 * These contracts define template structure, versioning,
 * metadata, and events used across the control plane.
 */

export interface Template {
  id: string;
  organizationId: string;
  projectId: string;
  name: string;
  description: string;
  type: string; // workflow, decision, reimbursement, connector
  activeVersion: number;
  createdAt: string;
  createdBy: string;
  metadata: Record<string, unknown>;
}

export interface TemplateVersion {
  id: string;
  templateId: string;
  version: number;
  payload: Record<string, unknown>;
  createdAt: string;
  createdBy: string;
  metadata: Record<string, unknown>;
}

export interface TemplateEvent {
  id: string;
  templateId: string;
  type: "created" | "updated" | "version_added" | "version_removed" | "error";
  timestamp: string;
  metadata: Record<string, unknown>;
}
