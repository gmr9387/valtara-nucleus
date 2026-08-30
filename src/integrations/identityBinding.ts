/**
 * identityBinding.ts
 *
 * Nucleus Identity Binding Specification
 *
 * This defines the unified identity model for the entire Valtaris ecosystem.
 * All arms (Glue, Decision Weaver, Guardian, DualPay) must use this identity
 * structure when performing actions, publishing events, or enforcing contracts.
 */

export interface NucleusIdentity {
  tenantId: string;
  projectId: string;
  environmentId: string;
  actorId?: string; // user, workflow, system, etc.
}

/**
 * Identity Provider Interface
 *
 * Arms call into this to resolve identity context.
 */

export interface NucleusIdentityProvider {
  resolveIdentity(): Promise<NucleusIdentity>;
  withIdentity<T>(identity: NucleusIdentity, fn: () => Promise<T>): Promise<T>;
}

/**
 * Default stub implementation.
 *
 * Later swaps will:
 * - bind to Supabase auth
 * - bind to RLS policies
 * - bind to Nucleus resource hierarchy
 * - bind to workflow runtime identity
 */

export const identityProvider: NucleusIdentityProvider = {
  async resolveIdentity() {
    // Placeholder identity for now
    return {
      tenantId: "default-tenant",
      projectId: "default-project",
      environmentId: "dev",
      actorId: "system"
    };
  },

  async withIdentity(identity, fn) {
    console.log("[NUCLEUS IDENTITY] Using identity:", identity);
    return await fn();
  }
};

/**
 * Helper to attach identity to any payload.
 */

export function attachIdentity<T>(
  identity: NucleusIdentity,
  payload: T
): T & { identity: NucleusIdentity } {
  return {
    ...payload,
    identity
  };
}
