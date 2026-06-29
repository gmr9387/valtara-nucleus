import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildOperationsReadiness } from "@/lib/core/services/readiness-operations";

describe("buildOperationsReadiness", () => {
  it("preserves the readiness response contract shape", () => {
    const readiness = buildOperationsReadiness({
      orgId: "org_1",
      counts: {
        projects: 2,
        environments: 3,
        credentials: 2,
        credentialsActive: 2,
        credentialsRotating: 0,
        bindings: 1,
        bindingsActive: 1,
        bindingsError: 0,
        workflows: 1,
        workflowsActive: 1,
        workflowRunsRecent: 3,
        workflowRunsFailed: 0,
        telemetryEvents24h: 5,
        auditEvents24h: 4,
      },
    });

    assert.deepEqual(Object.keys(readiness), ["orgScopeId", "areas", "summary"]);
    assert.deepEqual(Object.keys(readiness.summary), [
      "ready",
      "partial",
      "absent",
      "unknown",
      "total",
      "readinessScore",
    ]);
    assert.deepEqual(
      readiness.areas.map((area) => area.key),
      ["projects", "secrets", "connectors", "workflows", "runs", "telemetry", "audit"],
    );
    assert.deepEqual(
      readiness.areas.map((area) => area.label),
      [
        "Projects",
        "Secrets",
        "Connectors",
        "Workflows",
        "Workflow runs (24h)",
        "Telemetry (24h)",
        "Audit (24h)",
      ],
    );
    assert.equal(readiness.summary.total, 7);
    assert.equal(readiness.summary.readinessScore, 100);
    assert.deepEqual(Object.keys(readiness.areas[0] ?? {}), [
      "key",
      "label",
      "level",
      "primary",
      "detail",
    ]);
  });
});
