// src/nucleus/tests/guardianConstitutionalLineage.ts

import { GuardianRuntime } from "../subsystems/guardian/guardianRuntime";

export async function guardianConstitutionalLineage() {
  const runtime = new GuardianRuntime("test-org");

  const sampleClaim = {
    claimId: "lineage-001",
    organizationId: "test-org",
    claimPayload: { amount: 250, memberId: "M999" }
  };

  const result = await runtime.run(sampleClaim);

  const events = result.unifiedClaim.lifecycleEvents;

  if (!Array.isArray(events) || events.length === 0) {
    throw new Error("Guardian must produce lifecycle lineage events.");
  }

  const transitions = events.map(e => `${e.from}->${e.to}`);

  const validTransitions = [
    "INGESTED->EVALUATED",
    "EVALUATED->REPAIRED",
    "REPAIRED->ENFORCED",
    "ENFORCED->FINALIZED"
  ];

  for (const t of transitions) {
    if (!validTransitions.includes(t)) {
      throw new Error(`Invalid lifecycle transition detected: ${t}`);
    }
  }

  return {
    status: "passed",
    test: "guardianConstitutionalLineage"
  };
}
