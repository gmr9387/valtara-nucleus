// Phase 17 — Glue telemetry constitutional test

import { GlueRuntime } from "../runtime/../subsystems/glue/glueRuntime";
import { eventBus } from "../events/eventBus";

describe("Telemetry — Glue", () => {
  test("emits telemetry for execution", (done) => {
    const base = {
      claimId: "t-glue-1",
      organizationId: "org-telemetry",
      authorization: { decision: "allow" },
      recommendation: { action: "approve", confidence: 0.9 }
    };

    eventBus.on("telemetry.glue.execution", (signal) => {
      expect(signal.subsystem).toBe("glue");
      expect(signal.contract).toBe("execution");
      expect(signal.claimId).toBe("t-glue-1");
      expect(signal.organizationId).toBe("org-telemetry");
      done();
    });

    GlueRuntime.handle("execution", base);
  });
});
