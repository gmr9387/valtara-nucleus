// Phase 17 — DualPay telemetry constitutional test

import { DualPayRuntime } from "../runtime/../subsystems/dualpay/dualPayRuntime";
import { eventBus } from "../events/eventBus";

describe("Telemetry — DualPay", () => {
  test("emits telemetry for payment", (done) => {
    const base = {
      claimId: "t-dualpay-1",
      organizationId: "org-telemetry",
      execution: { status: "executed" },
      authorization: { decision: "allow" },
      recommendation: { confidence: 0.9 }
    };

    eventBus.on("telemetry.dualpay.payment", (signal) => {
      expect(signal.subsystem).toBe("dualpay");
      expect(signal.contract).toBe("payment");
      expect(signal.claimId).toBe("t-dualpay-1");
      expect(signal.organizationId).toBe("org-telemetry");
      done();
    });

    DualPayRuntime.handle("payment", base);
  });
});
