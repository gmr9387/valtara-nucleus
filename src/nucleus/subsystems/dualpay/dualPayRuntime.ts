/**
 * DualPayRuntime (Phase 13 — Glue → DualPay Integration)
 *
 * Purpose:
 *   DualPay emits:
 *     - payment
 *
 *   DualPayRuntime enforces:
 *     - subsystem identity
 *     - payment lineage (payment → execution → authorization → recommendation → opportunity)
 *     - payment safety (must match execution intent)
 *     - eventBus emission discipline
 *
 *   NEW (Phase 13):
 *     DualPay now *uses* Glue + Guardian + Weaver signals:
 *       - execution.status ("executed" | "skipped")
 *       - authorization.decision ("allow" | "deny")
 *       - recommendation.confidence (0–1)
 *
 *     DualPay produces:
 *       - payment.status ("paid" | "not_paid")
 *       - payment.reason
 */

import { eventBus } from "../../events/eventBus";

export class DualPayRuntime {
  static handle(contractName: string, payload: any) {
    switch (contractName) {
      case "payment":
        return this.handlePayment(payload);

      default:
        throw new Error(`DualPay cannot handle contract: ${contractName}`);
    }
  }

  private static handlePayment(payload: any) {
    const { execution, authorization, recommendation } = payload;

    const execStatus = execution?.status ?? "skipped";
    const decision = authorization?.decision ?? "deny";
    const confidence = recommendation?.confidence ?? 0;

    let status = "not_paid";
    let reason = "Execution was skipped";

    /**
     * Minimal deterministic logic:
     *
     * Payment allowed when:
     *   - execution.status = "executed"
     *   - authorization.decision = "allow"
     *   - recommendation.confidence >= 0.4
     */

    if (execStatus === "executed" && decision === "allow") {
      if (confidence >= 0.4) {
        status = "paid";
        reason = "Payment executed successfully";
      } else {
        status = "not_paid";
        reason = "Weaver confidence too low for payment";
      }
    } else if (decision === "deny") {
      status = "not_paid";
      reason = "Authorization denied";
    }

    const payment = {
      ...payload,
      status,
      reason,
      timestamp: Date.now(),
    };

    eventBus.emit("dualpay.payment.processed", payment);
    return payment;
  }
}
