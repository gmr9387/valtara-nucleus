// Phase 5.2 — ExternalContractAdapter
// High‑fidelity adapter: external contracts → validated NucleusEvent → eventBus

import { NucleusEvent } from "../events/nucleusEvent";
import { NucleusIdentity } from "../identity/nucleusIdentity";
import { eventBus } from "../events/eventBus";
import {
  validateContract,
  ContractValidationResult,
} from "../contracts/contractRegistry";

export interface ExternalContractMetadata {
  sourceSystem: string;
  correlationId?: string;
  traceId?: string;
}

export interface ExternalContractPayload {
  // Arbitrary external payload; validated by contractRegistry.
  [key: string]: unknown;
}

export interface ExternalContract {
  name: string; // canonical contract name
  version: string;
  payload: ExternalContractPayload;
  tenantId: string;
  projectId?: string;
  environmentId?: string;
  actorId?: string;
  metadata: ExternalContractMetadata;
}

export class ExternalContractAdapter {
  /**
   * Normalize external identity → NucleusIdentity
   */
  static toIdentity(external: ExternalContract): NucleusIdentity {
    return {
      tenantId: external.tenantId,
      projectId: external.projectId,
      environmentId: external.environmentId,
      actorId: external.actorId,
    };
  }

  /**
   * Validate external contract against constitutional registry.
   * Throws on invalid contracts; does NOT attempt to "fix" them.
   */
  static validate(external: ExternalContract): ContractValidationResult {
    return validateContract(external.name, external.version, external.payload);
  }

  /**
   * Normalize external contract → NucleusEvent
   * Only valid contracts are allowed through.
   */
  static toNucleusEvent(external: ExternalContract): NucleusEvent {
    const validation = this.validate(external);

    if (!validation.valid) {
      // You can swap this to a structured error envelope if desired.
      throw new Error(
        `Invalid external contract: ${external.name}@${external.version} — ${validation.reason ?? "unknown reason"}`
      );
    }

    const identity = this.toIdentity(external);

    return {
      type: external.name, // contract name becomes event type
      version: external.version,
      payload: external.payload,
      source: external.metadata.sourceSystem,
      context: identity,
      timestamp: new Date().toISOString(),
      correlationId: external.metadata.correlationId,
      traceId: external.metadata.traceId,
    };
  }

  /**
   * Emit external contract into the constitutional eventBus.
   * Returns the NucleusEvent for lineage/observability.
   */
  static emit(external: ExternalContract): NucleusEvent {
    const nucleusEvent = this.toNucleusEvent(external);
    eventBus.emit(nucleusEvent);
    return nucleusEvent;
  }
}
