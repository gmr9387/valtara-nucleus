// src/nucleus/subsystems/gateway/gatewayAdapter.ts

import { GatewayRuntime } from "./gatewayRuntime";

export class GatewayAdapter {
  static ingress(organizationId: string, claimPayload: Record<string, any>) {
    return GatewayRuntime.handle("ingress", { organizationId, claimPayload });
  }
}
