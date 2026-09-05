// Phase 33 — Lineage Audit

import { nucleus } from "../runtime/nucleusRuntime";
import { auditIdentity } from "./auditIdentity";

export function runLineageAudit() {
  console.log("🔵 Running lineage audit...");

  const event = nucleus.weaver.discover(
    { message: "Lineage audit event" },
    auditIdentity
  );

  const lineage = nucleus.lineage.list();

  const hasEntry = lineage.some(
    (entry) =>
      entry.eventType === event.type &&
      entry.identity.actorId === auditIdentity.actorId
  );

  return {
    event,
    lineage,
    hasEntry,
  };
}
