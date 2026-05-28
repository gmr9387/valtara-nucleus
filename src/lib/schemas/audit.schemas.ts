import { z } from "zod";

export const auditActionSchema = z.enum([
  "create",
  "update",
  "delete",
  "invite",
  "remove",
  "switch_org",
  "sign_in",
  "sign_up",
  "sign_out",
  "view",
  "publish",
  "archive",
  "restore",
  "execute",
  "approve",
  "reject",
  "rotate_secret",
  "replay",
]);

export const auditEventSchema = z.object({
  organization_id: z.string().uuid().nullable().optional(),
  module: z.string().min(1).max(64),
  entity_type: z.string().min(1).max(64),
  entity_id: z.string().nullable().optional(),
  action: auditActionSchema,
  before: z.unknown().optional(),
  after: z.unknown().optional(),
  correlation_id: z.string().uuid().nullable().optional(),
});

export type AuditAction = z.infer<typeof auditActionSchema>;
export type AuditEventInput = z.infer<typeof auditEventSchema>;
