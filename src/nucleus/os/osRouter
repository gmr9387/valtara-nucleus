// src/nucleus/os/osRouter.ts

/**
 * OSRouter (Phase 12.2)
 *
 * Purpose:
 *   Route OS app requests to the correct OSBridge method.
 *
 *   This is the entrypoint your OS apps will call.
 */

import { OSBridge } from "./osBridge";

export class OSRouter {
  constructor(private bridge: OSBridge) {}

  route(request: {
    subsystem: "weaver" | "guardian" | "glue" | "dualpay";
    action: string;
    version: string;
    payload: any;
  }) {
    const { subsystem, action, version, payload } = request;

    switch (subsystem) {
      case "weaver":
        if (action === "opportunity") return this.bridge.emitOpportunity(version, payload);
        if (action === "recommendation") return this.bridge.emitRecommendation(version, payload);
        break;

      case "guardian":
        if (action === "authorization") return this.bridge.emitAuthorization(version, payload);
        break;

      case "glue":
        if (action === "execution") return this.bridge.emitExecution(version, payload);
        break;

      case "dualpay":
        if (action === "payment") return this.bridge.emitPayment(version, payload);
        break;
    }

    throw new Error(`Invalid OSRouter action: ${subsystem}.${action}`);
  }
}
