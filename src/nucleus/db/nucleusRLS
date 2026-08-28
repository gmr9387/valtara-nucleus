// src/nucleus/db/nucleusRLS.ts

/**
 * NucleusRLS (Phase 13.2)
 *
 * Purpose:
 *   Enforce tenant isolation and constitutional constraints
 *   BEFORE any DB write or read.
 */

export class NucleusRLS {
  static enforceOrganization(payload: any, organizationId: string) {
    if (payload.organizationId !== organizationId) {
      throw new Error("RLS violation: organizationId mismatch");
    }
  }

  static enforceContractType(subsystem: string, name: string) {
    const allowed: Record<string, string[]> = {
      weaver: ["opportunity", "recommendation"],
      guardian: ["authorization"],
      glue: ["execution"],
      dualpay: ["payment"],
    };

    if (!allowed[subsystem].includes(name)) {
      throw new Error(`RLS violation: ${subsystem} cannot emit ${name}`);
    }
  }
}
