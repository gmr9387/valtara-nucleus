/**
 * Audit contracts for the Valtaris ecosystem.
 * These contracts define audit events, metadata, and
 * traceability structures used across all runtimes for
 * governance, compliance, and deterministic review.
 */

export interface AuditActor {
  id: string;
  type: "user" | "system";
  metadata: Record<string, unknown>;
}

export interface AuditContext {
  actor: AuditActor;
  resource: string; // workflow, decision, reimbursement, connector, credential
  resourceId: string;
  environmentId: string;
  metadata: Record<string, unknown>;
}

export interface AuditEvent {
  id: string;
  context: AuditContext;
  action: string; // created, updated, executed, revoked, error
  timestamp: string;
  metadata: Record<string, unknown>;
}

export interface AuditTrace {
  id: string;
  events: AuditEvent[];
  createdAt: string;
  metadata: Record<string, unknown>;
}
