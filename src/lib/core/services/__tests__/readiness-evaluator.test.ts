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

  it("flags missing_event_contracts when contracts are unavailable", () => {
    const readiness = evaluateCoreReadinessSignals({
      orgId: "org_1",
      signals: {
        hasOrgSettings: true,
        hasRequiredRoles: true,
        hasEventContracts: false,
        hasSecrets: true,
        environmentConfigSafe: true,
        telemetryHealthy: true,
      },
    });

    assert.equal(readiness.blockers.length, 1);
    assert.equal(readiness.blockers[0]?.code, "missing_event_contracts");
    assert.equal(readiness.readinessScore, 75);
  });

  it("does not emit missing_event_contracts when contracts are available", () => {
    const readiness = evaluateCoreReadinessSignals({
      orgId: "org_1",
      signals: {
        hasOrgSettings: true,
        hasRequiredRoles: true,
        hasEventContracts: true,
        hasSecrets: false,
        environmentConfigSafe: true,
        telemetryHealthy: true,
      },
    });

    assert.equal(readiness.blockers.length, 0);
    assert.equal(
      readiness.issues.some((issue) => issue.code === "missing_event_contracts"),
      false,
    );
    assert.equal(readiness.readinessScore, 90);
  });
});
