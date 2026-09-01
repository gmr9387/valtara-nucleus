// src/nucleus/subsystems/weaver/weaverTelemetry.ts

import { eventBus } from "../../events/eventBus";

export class WeaverTelemetry {
  static emit(type: "opportunity" | "recommendation", payload: any) {
    eventBus.emit(`weaver.telemetry.${type}`, {
      timestamp: new Date().toISOString(),
      type,
      claimId: payload.claimId,
      organizationId: payload.organizationId,
      payload,
    });
  }
}
