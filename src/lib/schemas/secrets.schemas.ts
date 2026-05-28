// Re-export the existing secret schemas from the legacy module for parity.
export {
  credentialStatusSchema,
  rotationReasonSchema,
  createCredentialSchema,
  rotateCredentialSchema,
  deactivateCredentialSchema,
  buildRedactedPreview,
  type CredentialStatus,
  type RotationReason,
  type CreateCredentialInput,
  type RotateCredentialInput,
  type DeactivateCredentialInput,
} from "@/lib/schemas";
