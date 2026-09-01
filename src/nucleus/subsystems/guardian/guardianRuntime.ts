import { eventBus } from "../../events/eventBus";
import { recordTelemetry } from "../../telemetry/telemetry";

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
      reason = "Weaver recommends review";
    }

    const result = {
      ...payload,
      decision,
      reason,
      timestamp: Date.now(),
    };

    eventBus.emit("guardian.authorization.processed", result);

    recordTelemetry(
      "guardian",
      "authorization",
      result.claimId,
      result.organizationId,
      result
    );

    return result;
  }
}
