// Phase 29 — Full Verification Suite Runner

import { verifySubsystems } from "./subsystemVerification";
import { verifyResources } from "./resourceVerification";
import { verifyIdentityPropagation } from "./identityVerification";
import { verifyStateEngine } from "./stateVerification";

export function runVerificationSuite() {
  console.log("🔵 Phase 29 — Constitutional Verification Suite Starting...");

  const subsystems = verifySubsystems();
  const resources = verifyResources();
  const identity = verifyIdentityPropagation();
  const state = verifyStateEngine();

  console.log("🟢 Subsystem verification:", subsystems);
  console.log("🟢 Resource verification:", resources);
  console.log("🟢 Identity propagation verification:", identity);
  console.log("🟢 State engine verification:", state);

  console.log("🔵 Phase 29 — Verification Suite Complete.");
}
