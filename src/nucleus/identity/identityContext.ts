// src/nucleus/identity/identityContext.ts
// Full file — Identity context model

export type IdentityContext = {
  organizationId: string;
  subsystem: string;
  actor?: string;
  roles?: string[];
};
