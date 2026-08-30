import { registerSubsystem } from "./subsystemRegistry";
import { WeaverRuntime } from "./weaverRuntime";
import { GuardianRuntime } from "./guardianRuntime";
import { GlueRuntime } from "./glueRuntime";
import { DualPayRuntime } from "./dualpayRuntime";

export function registerAllSubsystems() {
  registerSubsystem({
    name: "weaver",
    capabilities: [
      "discover_financial_opportunity",
      "detect_cross_system_anomaly"
    ],
    runtime: WeaverRuntime
  });

  registerSubsystem({
    name: "guardian",
    capabilities: [
      "authorize_financial_action",
      "evaluate_policy",
      "enforce_approval_threshold"
    ],
    runtime: GuardianRuntime
  });

  registerSubsystem({
    name: "glue",
    capabilities: [
      "execute_workflow",
      "schedule_action",
      "retry_operation",
      "reconcile_execution"
    ],
    runtime: GlueRuntime
  });

  registerSubsystem({
    name: "dualpay",
    capabilities: [
      "analyze_healthcare_reimbursement",
      "reconcile_remittance",
      "identify_claim_recovery"
    ],
    runtime: DualPayRuntime
  });
}
