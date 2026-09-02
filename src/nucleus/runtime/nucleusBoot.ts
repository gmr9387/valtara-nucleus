// src/nucleus/runtime/nucleusBoot.ts

import { NucleusRuntime } from "./nucleusRuntime";
import { nucleusBoot as constitutionBoot } from "../state/nucleusBoot";
import { registerAllSubsystems } from "../subsystems/registerSubsystems";
import { Subsystem } from "./runtimeGuards";

/**
 * Authoritative Nucleus Boot Sequence
 *
 * - Initializes constitutional KNOW layer
 * - Registers subsystems
 * - Creates NucleusRuntime
 */
export function nucleusBoot(
  subsystem: Subsystem,
  organizationId: string
): NucleusRuntime {
  console.log("=== [Nucleus] Unified Boot Sequence Starting ===");

  // 1. Constitutional initialization (KNOW)
  constitutionBoot();

  // 2. Subsystem registration
  registerAllSubsystems();

  // 3. Runtime initialization (DO)
  const runtime = new NucleusRuntime(subsystem, organizationId);
  runtime.boot();

  console.log("=== [Nucleus] Unified Boot Sequence Complete ===");

  return runtime;
}
