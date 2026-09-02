// src/glue/glueRuntime.ts

import { eventBus } from "../events/eventBus";
import { GlueEngine } from "./glueEngine";

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
    const input = {
      claimId: payload.claimId,
      organizationId: payload.organizationId,
      opportunityScore: payload.opportunity?.score,
      authorization: payload.authorization,
      metadata: payload.claimPayload?.metadata
    };

    const decision = GlueEngine.decide(input);

    const result = {
      ...payload,
      execution: {
        ...decision,
        timestamp: Date.now()
      }
    };

    eventBus.emit("glue.execution.processed", result);
    return result;
  }
}
