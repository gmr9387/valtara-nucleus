import { eventBus } from "../../events/eventBus";
import { recordTelemetry } from "../../telemetry/telemetry";

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

    if (decision === "allow") {
      if (action !== "deny" && confidence >= 0.3) {
        status = "executed";
        reason = "Execution allowed";
      } else {
        reason = "Weaver confidence insufficient";
      }
    }

    const result = {
      ...payload,
      status,
      reason,
      timestamp: Date.now(),
    };

    eventBus.emit("glue.execution.processed", result);

    recordTelemetry(
      "glue",
      "execution",
      result.claimId,
      result.organizationId,
      result
    );

    return result;
  }
}
