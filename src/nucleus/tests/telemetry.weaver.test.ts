// Phase 17 — Weaver telemetry constitutional test

import { WeaverRuntime } from "../runtime/../subsystems/weaver/weaverRuntime";
import { eventBus } from "../events/eventBus";

describe("Telemetry — Weaver", () => {
  test("emits telemetry for opportunity + recommendation", (done) => {
    const base = {
      claimId: "t-weaver-1",
      organizationId: "org-telemetry",
      claimPayload: { amount: 500 }
    };

    let received = 0;

    eventBus.on("telemetry.weaver.opportunity", (signal) => {
      expect(signal.subsystem).toBe("weaver");
      expect(signal.contract).toBe("opportunity");
      expect(signal.claimId).toBe("t-weaver-1");
      expect(signal.organizationId).toBe("org-telemetry");
      received++;
      if (received === 2) done();
    });

    eventBus.on("telemetry.weaver.recommendation", (signal) => {
      expect(signal.subsystem).toBe("weaver");
      expect(signal.contract).toBe("recommendation");
      expect(signal.claimId).toBe("t-weaver-1");
      expect(signal.organizationId).toBe("org-telemetry");
      received++;
      if (received === 2) done();
    });

    WeaverRuntime.handle("opportunity", base);
    WeaverRuntime.handle("recommendation", base);
  });
});
