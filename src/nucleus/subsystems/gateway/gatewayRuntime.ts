// src/nucleus/subsystems/gateway/gatewayRuntime.ts

import { eventBus } from "../../events/eventBus";
import { GatewayEngine } from "./gatewayEngine";

export class GatewayRuntime {
  static handle(contractName: string, payload: any) {
    switch (contractName) {
      case "ingress":
        return this.handleIngress(payload);

      default:
        throw new Error(`Gateway cannot handle contract: ${contractName}`);
    }
  }

  private static handleIngress(payload: any) {
    const normalized = GatewayEngine.normalize(payload);

    eventBus.emit("gateway.ingress.normalized", normalized);
    return normalized;
  }
}
