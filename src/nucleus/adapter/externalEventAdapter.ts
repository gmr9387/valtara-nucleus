// Phase 5.1 — ExternalEventAdapter
// High‑fidelity adapter: external events → NucleusEvent → eventBus

import { NucleusEvent } from "../events/nucleusEvent";
import { NucleusIdentity } from "../identity/nucleusIdentity";
import { eventBus } from "../events/eventBus";

export interface ExternalEventMetadata {
  sourceSystem: string;
  correlationId?: string;
  traceId?: string;
}

export interface ExternalEventPayload {
  // Arbitrary external payload; Nucleus does not assume shape here.
  [key: string]: unknown;
}

export interface ExternalEvent {
  type: string;
  version: string;
  payload: ExternalEventPayload;
  tenantId: string;
  projectId?: string;
  environmentId?: string;
  actorId?: string;
  metadata: ExternalEventMetadata;
}

export class ExternalEventAdapter {
  /**
   * Normalize external identity → NucleusIdentity
   */
  static toIdentity(external: ExternalEvent): NucleusIdentity {
    return {
      tenantId: external.tenantId,
      projectId: external.projectId,
      environmentId: external.environmentId,
      actorId: external.actorId,
    };
  }

  /**
   * Normalize external event → NucleusEvent
   * This does NOT execute workflows; it only wraps and emits.
   */
  static toNucleusEvent(external: ExternalEvent): NucleusEvent {
    const identity = this.toIdentity(external);

    return {
      type: external.type,
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
   * Emit external event into the constitutional eventBus.
   * Returns the NucleusEvent for lineage/observability.
   */
  static emit(external: ExternalEvent): NucleusEvent {
    const nucleusEvent = this.toNucleusEvent(external);
    eventBus.emit(nucleusEvent);
    return nucleusEvent;
  }
}
