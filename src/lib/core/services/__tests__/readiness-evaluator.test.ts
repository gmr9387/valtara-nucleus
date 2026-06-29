import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { evaluateCoreReadinessSignals } from "@/lib/core/services/readiness-evaluator";

describe("evaluateCoreReadinessSignals", () => {
  it("returns full score when all readiness signals pass", () => {
    const readiness = evaluateCoreReadinessSignals({
      orgId: "org_1",
      signals: {
        hasOrgSettings: true,
        hasRequiredRoles: true,
        hasEventContracts: true,
        hasSecrets: true,
        environmentConfigSafe: true,
        telemetryHealthy: true,
      },
    });

    assert.equal(readiness.readinessScore, 100);
    assert.equal(readiness.issues.length, 0);
  });

  it("returns blockers when critical signals fail", () => {
    const readiness = evaluateCoreReadinessSignals({
      orgId: "org_1",
      signals: {
        hasOrgSettings: false,
        hasRequiredRoles: false,
        hasEventContracts: false,
        hasSecrets: false,
        environmentConfigSafe: false,
        telemetryHealthy: false,
      },
    });

    assert.equal(readiness.blockers.length, 4);
    assert.ok(readiness.readinessScore < 100);
  });
});
