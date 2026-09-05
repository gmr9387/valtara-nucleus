// Phase 33 — Resource Audit

import { nucleus } from "../runtime/nucleusRuntime";
import { auditIdentity } from "./auditIdentity";

export function runResourceAudit() {
  console.log("🔵 Running resource audit...");

  nucleus.resources.createResource(
    "audit-resource",
    "AuditResource",
    {
      tenantId: auditIdentity.tenantId,
      environmentId: auditIdentity.environmentId,
      projectId: auditIdentity.projectId,
      subsystem: "weaver",
      capability: "discover",
      actorId: auditIdentity.actorId,
    },
    { status: "initial", auditTrail: [] }
  );

  const mutationEvent = nucleus.weaver.evaluate(
    {
      resourceId: "audit-resource",
      mutate: (data: any) => ({
        ...data,
        auditTrail: [...data.auditTrail, "weaver-evaluated"],
      }),
    },
    auditIdentity
  );

  const resource = nucleus.resources.getResource("audit-resource");

  const boundaryCheck =
    resource?.identity.tenantId === auditIdentity.tenantId &&
    resource?.identity.environmentId === auditIdentity.environmentId &&
    resource?.identity.projectId === auditIdentity.projectId &&
    resource?.identity.subsystem === "weaver";

  return {
    mutationEvent,
    resource,
    boundaryCheck,
  };
}
