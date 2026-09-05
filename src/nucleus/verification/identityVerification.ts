// Phase 29 — Identity Verification

import { nucleus } from "../runtime/nucleusRuntime";
import { verificationIdentity } from "./verificationIdentity";

export function verifyIdentityPropagation() {
  console.log("🔵 Verifying identity propagation across all engines...");

  const event = nucleus.weaver.discover(
    { message: "Identity propagation test" },
    verificationIdentity
  );

  const lineage = nucleus.lineage.list();
  const telemetry = nucleus.telemetry.list();

  const lineageMatch = lineage.some(
    (entry) => entry.identity.tenantId === verificationIdentity.tenantId
  );

  const telemetryMatch = telemetry.some(
    (entry) => entry.identity.capability === verificationIdentity.capability
  );

  return {
    event,
    lineageMatch,
    telemetryMatch,
  };
}
