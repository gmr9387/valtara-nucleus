// src/nucleus/subsystems/registerSubsystems.ts

import { registerSubsystem } from "./subsystemRegistry";

import { GuardianRuntime } from "./guardian/guardianRuntime";
import { GlueRuntime } from "./glue/glueRuntime";
import { WeaverRuntime } from "./weaver/weaverRuntime";
import { DualPayRuntime } from "./dualpay/dualpayRuntime";
import { ContractsRuntime } from "./contracts/contractsRuntime";

export function registerAllSubsystems() {
  registerSubsystem({
    id: "guardian",
    label: "Guardian Risk Engine",
    enabled: true,
    runtime: GuardianRuntime,
  });

  registerSubsystem({
    id: "contracts",
    label: "Contracts Engine",
    enabled: true,
    runtime: ContractsRuntime,
  });

  registerSubsystem({
    id: "glue",
    label: "Glue Integration Engine",
    enabled: true,
    runtime: GlueRuntime,
  });

  registerSubsystem({
    id: "weaver",
    label: "Weaver Intelligence Engine",
    enabled: true,
    runtime: WeaverRuntime,
  });

  registerSubsystem({
    id: "dualpay",
    label: "DualPay Payment Intelligence",
    enabled: true,
    runtime: DualPayRuntime,
  });
}
