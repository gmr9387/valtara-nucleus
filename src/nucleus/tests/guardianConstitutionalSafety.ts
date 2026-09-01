// src/nucleus/tests/guardianConstitutionalSafety.ts

import { subsystemRegistry } from "../subsystems/subsystemRegistry";
import { GuardianRuntime } from "../subsystems/guardian/guardianRuntime";

export async function guardianConstitutionalSafety() {
  const guardian = subsystemRegistry.find(s => s.id === "guardian");
  if (!guardian || !guardian.enabled) {
    throw new Error("Guardian subsystem must be enabled in the Constitution.");
  }

  const runtime = new GuardianRuntime("test-org");

  const sampleClaim = {
    claimId: "test-001",
    organizationId: "test-org",
    claimPayload: { amount: 100, memberId: "M123" }
  };

  const result = await runtime.run(sampleClaim);

  if (!result.unifiedClaim) {
    throw new Error("Guardian must produce a unified claim object.");
  }

  if (!result.unifiedClaim.lifecycleState) {
    throw new Error("Guardian must produce a valid lifecycle state.");
  }

  const allowedStates = [
    "INGESTED",
    "EVALUATED",
    "REPAIRED",
    "ENFORCED",
    "FINALIZED",
    "REOPENED"
  ];

  if (!allowedStates.includes(result.unifiedClaim.lifecycleState)) {
    throw new Error("Guardian lifecycle state violates constitutional safety.");
  }

  return {
    status: "passed",
    test: "guardianConstitutionalSafety"
  };
}
