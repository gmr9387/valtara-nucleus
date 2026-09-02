// src/nucleus/runtime/nucleusBoot.ts

import { nucleusBoot as constitutionBoot } from "../state/nucleusBoot";
import { registerAllSubsystems } from "../subsystems/registerSubsystems";
import { NucleusRuntime } from "./nucleusRuntime";
import { Subsystem } from "./runtimeGuards";

/**
 * Unified Nucleus Boot Sequence (Phase 2)
 * ---------------------------------------
 * - Constitutional boot (KNOW)
 * - Subsystem registration
 * - Runtime creation
 */
export function nucleusBoot(
  subsystem: Subsystem,
  organizationId: string
): NucleusRuntime {
  console.log("=== [Nucleus] Unified Boot Sequence Starting ===");

  // 1. Constitutional initialization
  constitutionBoot();

  // 2. Register all subsystems
  registerAllSubsystems();

  // 3. Create runtime instance
  const runtime = new NucleusRuntime(subsystem, organizationId);
  runtime.boot();

  console.log("=== [Nucleus] Unified Boot Sequence Complete ===");

  return runtime;
}
