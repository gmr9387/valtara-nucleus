// Phase 17 — Guardian telemetry constitutional test

import { GuardianRuntime } from "../runtime/../subsystems/guardian/guardianRuntime";
import { eventBus } from "../events/eventBus";

describe("Telemetry — Guardian", () => {
  test("emits telemetry for authorization", (done) => {
    const base = {
      claimId: "t-guardian-1",
      organizationId: "org-telemetry",
      opportunity: { score: 80 },
      recommendation: { action: "approve", confidence: 0.8 }
    };

    eventBus.on("telemetry.guardian.authorization", (signal) => {
      expect(signal.subsystem).toBe("guardian");
      expect(signal.contract).toBe("authorization");
      expect(signal.claimId).toBe("t-guardian-1");
      expect(signal.organizationId).toBe("org-telemetry");
      done();
    });

    GuardianRuntime.handle("authorization", base);
  });
});
