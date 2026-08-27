// src/nucleus/integrations/weaverIntegration.ts

/**
 * WeaverIntegration (Phase 7.2)
 *
 * Purpose:
 *   Provide a clean integration surface for Weaver.
 */

import { NucleusIntegration } from "./nucleusIntegration";

export class WeaverIntegration {
  private nucleus: NucleusIntegration;

  constructor(organizationId: string) {
    this.nucleus = new NucleusIntegration("weaver", organizationId);
  }

  emitOpportunity(version: string, payload: any) {
    return this.nucleus.emitContract("opportunity", version, payload);
  }

  emitRecommendation(version: string, payload: any) {
    return this.nucleus.emitContract("recommendation", version, payload);
  }

  lineage() {
    return this.nucleus.getLineage();
  }

  finalize() {
    return this.nucleus.finalize();
  }
}
