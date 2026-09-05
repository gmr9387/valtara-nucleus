// Phase 5.3 — ExternalIdentityAdapter
// High‑fidelity adapter: external identity → NucleusIdentity

import { NucleusIdentity } from "../identity/nucleusIdentity";

export interface RawExternalIdentity {
  tenantId?: unknown;
  projectId?: unknown;
  environmentId?: unknown;
  actorId?: unknown;
  // Optional raw blob for debugging/telemetry
  raw?: unknown;
}

export interface ExternalIdentity {
  tenantId: string;
  projectId?: string;
  environmentId?: string;
  actorId?: string;
  raw?: unknown;
}

export class ExternalIdentityAdapter {
  /**
   * Strict normalization: raw external identity → ExternalIdentity
   * This is where you can enforce type safety, defaults, etc.
   */
  static normalize(raw: RawExternalIdentity): ExternalIdentity {
    if (typeof raw.tenantId !== "string" || raw.tenantId.trim() === "") {
      throw new Error("External identity missing required tenantId");
    }

    const projectId =
      typeof raw.projectId === "string" ? raw.projectId : undefined;
    const environmentId =
      typeof raw.environmentId === "string" ? raw.environmentId : undefined;
    const actorId =
      typeof raw.actorId === "string" ? raw.actorId : undefined;

    return {
      tenantId: raw.tenantId,
      projectId,
      environmentId,
      actorId,
      raw: raw.raw,
    };
  }

  /**
   * ExternalIdentity → NucleusIdentity
   */
  static toNucleusIdentity(external: ExternalIdentity): NucleusIdentity {
    return {
      tenantId: external.tenantId,
      projectId: external.projectId,
      environmentId: external.environmentId,
      actorId: external.actorId,
    };
  }

  /**
   * Raw external identity → NucleusIdentity (full pipeline)
   */
  static fromRaw(raw: RawExternalIdentity): NucleusIdentity {
    const normalized = this.normalize(raw);
    return this.toNucleusIdentity(normalized);
  }
}
