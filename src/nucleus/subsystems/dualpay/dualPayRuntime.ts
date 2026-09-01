import { eventBus } from "../../events/eventBus";
import { recordTelemetry } from "../../telemetry/telemetry";

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
    let reason = "Execution skipped";

    if (execStatus === "executed" && decision === "allow") {
      if (confidence >= 0.4) {
        status = "paid";
        reason = "Payment executed";
      } else {
        reason = "Weaver confidence too low";
      }
    } else if (decision === "deny") {
      reason = "Authorization denied";
    }

    const result = {
      ...payload,
      status,
      reason,
      timestamp: Date.now(),
    };

    eventBus.emit("dualpay.payment.processed", result);

    recordTelemetry(
      "dualpay",
      "payment",
      result.claimId,
      result.organizationId,
      result
    );

    return result;
  }
}
