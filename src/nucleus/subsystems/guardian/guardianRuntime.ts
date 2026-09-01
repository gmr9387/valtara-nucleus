// src/nucleus/subsystems/guardian/guardianRuntime.ts

/**
 * GuardianRuntime (Phase 13 — Weaver → Guardian Integration)
 *
 * Purpose:
 *   Guardian emits:
 *     - authorization
 *
 *   GuardianRuntime enforces:
 *     - subsystem identity
 *     - contract lineage (authorization → recommendation → opportunity)
 *     - eventBus emission discipline
 *
 *   NEW (Phase 13):
 *     Guardian now *uses* Weaver signals:
 *       - opportunity.score
 *       - recommendation.action
 *       - recommendation.confidence
 *
 *     Guardian produces:
 *       - authorization.decision ("allow" | "deny")
 *       - authorization.reason
 */

import { eventBus } from "../../events/eventBus";

export class GuardianRuntime {
  static handle(contractName: string, payload: any) {
    switch (contractName) {
      case "authorization":
        return this.handleAuthorization(payload);

      default:
        throw new Error(`Guardian cannot handle contract: ${contractName}`);
    }
  }

  private static handleAuthorization(payload: any) {
    const { opportunity, recommendation } = payload;

    /**
     * Minimal deterministic logic:
     *
     * opportunity.score: number (0–100)
     * recommendation.confidence: number (0–1)
     * recommendation.action: string ("approve" | "deny" | "review")
     */

    const score = opportunity?.score ?? 0;
    const confidence = recommendation?.confidence ?? 0;
    const action = recommendation?.action ?? "review";

    let decision = "deny";
    let reason = "Insufficient confidence";

    if (action === "approve" && score >= 50 && confidence >= 0.5) {
      decision = "allow";
      reason = "Weaver signals strong approval";
    } else if (action === "review") {
      decision = "allow";
      reason = "Weaver recommends review; Guardian allows execution with caution";
    } else {
      decision = "deny";
      reason = "Weaver signals insufficient approval";
    }

    const authorization = {
      ...payload,
      decision,
      reason,
      timestamp: Date.now(),
    };

    eventBus.emit("guardian.authorization.processed", authorization);
    return authorization;
  }
}
