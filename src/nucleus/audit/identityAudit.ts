// Phase 33 — Identity Audit

import { nucleus } from "../runtime/nucleusRuntime";
import { auditIdentity } from "./auditIdentity";

export function runIdentityAudit() {
  console.log("🔵 Running identity audit...");

  const event = nucleus.weaver.discover(
    { message: "Identity audit event" },
    auditIdentity
  );

  const lineage = nucleus.lineage.list();
  const telemetry = nucleus.telemetry.list();

  const lineageMatch = lineage.some(
    (entry) =>
      entry.identity.tenantId === auditIdentity.tenantId &&
      entry.identity.subsystem === auditIdentity.subsystem &&
      entry.identity.capability === auditIdentity.capability
  );

  const telemetryMatch = telemetry.some(
    (entry) =>
      entry.identity.environmentId === auditIdentity.environmentId &&
      entry.identity.actorId === auditIdentity.actorId
  );

  return {
    event,
    lineageMatch,
    telemetryMatch,
  };
}
