// Phase 33 — Full Constitutional Audit Runner

import { runIdentityAudit } from "./identityAudit";
import { runResourceAudit } from "./resourceAudit";
import { runContractAudit } from "./contractAudit";
import { runLineageAudit } from "./lineageAudit";
import { runTelemetryAudit } from "./telemetryAudit";
import { runStateAudit } from "./stateAudit";

export function runAuditSuite() {
  console.log("🔵 Phase 33 — Constitutional Audit Starting...");

  const identity = runIdentityAudit();
  const resource = runResourceAudit();
  const contract = runContractAudit();
  const lineage = runLineageAudit();
  const telemetry = runTelemetryAudit();
  const state = runStateAudit();

  console.log("🟢 Identity audit:", identity);
  console.log("🟢 Resource audit:", resource);
  console.log("🟢 Contract audit:", contract);
  console.log("🟢 Lineage audit:", lineage);
  console.log("🟢 Telemetry audit:", telemetry);
  console.log("🟢 State audit:", state);

  console.log("🔵 Phase 33 — Constitutional Audit Complete.");
}
