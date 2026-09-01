/**
 * GlueRuntime (Phase 13 — Guardian → Glue Integration)
 *
 * Purpose:
 *   Glue emits:
 *     - execution
 *
 *   GlueRuntime enforces:
 *     - subsystem identity
 *     - execution lineage (execution → authorization → recommendation → opportunity)
 *     - execution safety (must match authorization intent)
 *     - eventBus emission discipline
 *
 *   NEW (Phase 13):
 *     Glue now *uses* Guardian + Weaver signals:
 *       - authorization.decision ("allow" | "deny")
 *       - recommendation.action ("approve" | "deny" | "review")
 *       - recommendation.confidence (0–1)
 *
 *     Glue produces:
 *       - execution.status ("executed" | "skipped")
 *       - execution.reason
 */

import { eventBus } from "../../events/eventBus";

export class GlueRuntime {
  static handle(contractName: string, payload: any) {
    switch (contractName) {
      case "execution":
        return this.handleExecution(payload);

      default:
        throw new Error(`Glue cannot handle contract: ${contractName}`);
    }
  }

  private static handleExecution(payload: any) {
    const { authorization, recommendation } = payload;

    const decision = authorization?.decision ?? "deny";
    const action = recommendation?.action ?? "review";
    const confidence = recommendation?.confidence ?? 0;

    let status = "skipped";
    let reason = "Authorization denied";

    /**
     * Minimal deterministic logic:
     *
     * Execution allowed when:
     *   - Guardian decision = "allow"
     *   - AND Weaver recommendation is not "deny"
     *   - AND confidence >= 0.3 (low threshold)
     */

    if (decision === "allow") {
      if (action !== "deny" && confidence >= 0.3) {
        status = "executed";
        reason = "Execution allowed by Guardian and supported by Weaver";
      } else {
        status = "skipped";
        reason = "Weaver recommendation insufficient for execution";
      }
    }

    const execution = {
      ...payload,
      status,
      reason,
      timestamp: Date.now(),
    };

    eventBus.emit("glue.execution.processed", execution);
    return execution;
  }
}
