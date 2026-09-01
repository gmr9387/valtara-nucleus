// src/nucleus/subsystems/weaver/weaverRuntime.ts

/**
 * WeaverRuntime (Phase 11)
 *
 * Purpose:
 *   Weaver emits:
 *     - opportunity
 *     - recommendation
 *
 *   WeaverRuntime enforces:
 *     - subsystem identity
 *     - contract lineage (recommendation → opportunity)
 *     - eventBus emission discipline
 */

import { eventBus } from "../../events/eventBus";
import { WeaverIntegrationLayer } from "./weaverIntegrationLayer";
import { WeaverTelemetry } from "./weaverTelemetry";

export class WeaverRuntime {
  /**
   * Handle validated contract emissions.
   * Called by RuntimeRouter AFTER constitutional checks.
   */
  static handle(contractName: string, payload: any) {
    switch (contractName) {
      case "opportunity":
        return this.handleOpportunity(payload);

      case "recommendation":
        return this.handleRecommendation(payload);

      default:
        throw new Error(`Weaver cannot handle contract: ${contractName}`);
    }
  }

  private static handleOpportunity(payload: any) {
    const result = WeaverIntegrationLayer.processOpportunity(payload);

    eventBus.emit("weaver.opportunity.processed", result);
    WeaverTelemetry.emit("opportunity", result);

    return result;
  }

  private static handleRecommendation(payload: any) {
    const result = WeaverIntegrationLayer.processRecommendation(payload);

    eventBus.emit("weaver.recommendation.processed", result);
    WeaverTelemetry.emit("recommendation", result);

    return result;
  }
}
