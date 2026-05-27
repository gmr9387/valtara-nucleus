import { z } from "zod";

export const credentialStatusSchema = z.enum(["active", "rotating", "deactivated"]);
export const connectorCategorySchema = z.enum([
  "ai", "payments", "messaging", "social", "database", "universal", "other",
]);
export const connectorStatusSchema = z.enum(["available", "beta", "deprecated"]);
export const bindingStatusSchema = z.enum(["active", "paused", "error"]);
export const healthStatusSchema = z.enum(["healthy", "degraded", "failed", "unknown"]);
export const rotationReasonSchema = z.enum(["scheduled", "manual", "compromised", "policy", "initial"]);

export const createCredentialSchema = z.object({
  organization_id: z.string().uuid(),
  provider_id: z.string().uuid(),
  project_id: z.string().uuid().nullable().optional(),
  environment_id: z.string().uuid().nullable().optional(),
  label: z.string().trim().min(2).max(120),
  initial_secret: z.string().min(8).max(8192),
});

export const rotateCredentialSchema = z.object({
  credential_id: z.string().uuid(),
  new_secret: z.string().min(8).max(8192),
  reason: rotationReasonSchema.default("manual"),
});

export const deactivateCredentialSchema = z.object({
  credential_id: z.string().uuid(),
});

export const createBindingSchema = z.object({
  organization_id: z.string().uuid(),
  connector_id: z.string().uuid(),
  credential_id: z.string().uuid().nullable().optional(),
  project_id: z.string().uuid().nullable().optional(),
  environment_id: z.string().uuid().nullable().optional(),
});

export type CreateCredentialInput = z.infer<typeof createCredentialSchema>;
export type RotateCredentialInput = z.infer<typeof rotateCredentialSchema>;
export type DeactivateCredentialInput = z.infer<typeof deactivateCredentialSchema>;
export type CreateBindingInput = z.infer<typeof createBindingSchema>;

/**
 * Build a redacted preview for a raw secret. Never persists the raw value.
 * Used by the secret server functions before insert.
 */
export function buildRedactedPreview(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.length <= 8) return "••••";
  return `${trimmed.slice(0, 4)}••••${trimmed.slice(-4)}`;
}
