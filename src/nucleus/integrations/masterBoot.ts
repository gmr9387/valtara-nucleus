// src/nucleus/integrations/masterBoot.ts

/**
 * Nucleus Master Boot Sequence
 *
 * This file ties together:
 *   - nucleusBoot (constitutional initialization)
 *   - subsystem runtimes (Weaver, Guardian, Glue, DualPay)
 *   - integration loader (Nucleus ↔ subsystem bindings)
 *
 * It is the single entry point for the constitutional ecosystem.
 */

import { nucleusBoot } from "../state/nucleusBoot";
import { loadIntegrations } from "./integrationLoader";

import { startWeaverRuntime } from "../subsystems/weaver/weaverRuntime";
import { startGuardianRuntime } from "../subsystems/guardian/guardianRuntime";
import { startGlueRuntime } from "../subsystems/glue/glueRuntime";
import { startDualPayRuntime } from "../subsystems/dualpay/dualPayRuntime";

export function masterBoot() {
  console.log("=== [Nucleus] Master Boot Sequence Starting ===");

  // 1. Initialize Nucleus constitutional state
  nucleusBoot();

  // 2. Start subsystem runtimes
  startWeaverRuntime();
  startGuardianRuntime();
  startGlueRuntime();
  startDualPayRuntime();

  // 3. Load all integrations
  loadIntegrations();

  console.log("=== [Nucleus] Master Boot Sequence Complete ===");
}
