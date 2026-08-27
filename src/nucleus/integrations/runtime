// src/nucleus/integrations/runtime.ts

/**
 * Nucleus Runtime Entrypoint
 *
 * This file exposes the master boot sequence as the public API
 * for starting the entire constitutional ecosystem.
 *
 * External systems should import and call:
 *
 *     import { startNucleus } from "@/nucleus/integrations/runtime";
 *     startNucleus();
 *
 * No subsystem logic lives here.
 * No orchestration logic lives here.
 * This is purely the entrypoint.
 */

import { masterBoot } from "./masterBoot";

export function startNucleus() {
  console.log("=== [Nucleus] Starting Runtime ===");
  masterBoot();
  console.log("=== [Nucleus] Runtime Active ===");
}
