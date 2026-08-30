// src/nucleus/runtime/nucleusBoot.ts
// Full file — Authoritative Nucleus Boot Sequence (Unified Constitutional Boot)

import { NucleusRuntime } from "./nucleusRuntime";

// Constitutional KNOW layer
import { nucleusBoot as constitutionBoot } from "../state/nucleusBoot";

// Subsystem runtimes
import { startWeaverRuntime } from "../subsystems/weaver/weaverRuntime";
import { startGuardianRuntime } from "../subsystems/guardian/guardianRuntime";
import { startGlueRuntime } from "../subsystems/glue/glueRuntime";
import { startDualPayRuntime } from "../subsystems/dualpay/dualPayRuntime";

// Integration loader
import { loadIntegrations } from "../integrations/integrationLoader";

export function nucleusBoot(subsystem: "weaver" | "guardian" | "glue" | "dualpay", organizationId: string) {
  console.log("=== [Nucleus] Unified Boot Sequence Starting ===");

  // 1. Constitutional initialization (KNOW)
  constitutionBoot();

  // 2. Runtime initialization (DO)
  const runtime = new NucleusRuntime(subsystem, organizationId);
  runtime.boot();

  // 3. Subsystem runtime initialization
  startWeaverRuntime();
  startGuardianRuntime();
  startGlueRuntime();
  startDualPayRuntime();

  // 4. Integration initialization
  loadIntegrations();

  console.log("=== [Nucleus] Unified Boot Sequence Complete ===");

  return runtime;
}
