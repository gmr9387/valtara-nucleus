// src/nucleus/contracts/NucleusIdentity.ts

/**
 * NucleusIdentity
 *
 * The constitutional identity contract for the Valtara ecosystem.
 * Every subsystem receives identity in this shape.
 *
 * Nucleus = KNOW
 * Weaver = FIND
 * Guardian = ALLOW
 * Glue = DO
 * DualPay = SPECIALIZE
 *
 * Identity is the anchor that keeps all actions multi-tenant,
 * multi-project, and multi-environment safe and consistent.
 */

export interface NucleusIdentity {
  tenantId: string;
  projectId: string;
  environmentId: string;
  actorId?: string; // Optional because some system events have no human actor
}

/**
 * Utility: createIdentity
 *
 * A small helper to standardize identity creation.
 * This prevents shape drift across subsystems.
 */
export function createIdentity(params: {
  tenantId: string;
  projectId: string;
  environmentId: string;
  actorId?: string;
}): NucleusIdentity {
  return {
    tenantId: params.tenantId,
    projectId: params.projectId,
    environmentId: params.environmentId,
    actorId: params.actorId,
  };
}
