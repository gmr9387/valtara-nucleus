// valtaris-nucleus/src/nucleus/integrations/runtimeHook.ts

import { startNucleus } from "../index";

/**
 * Integration Runtime Hook
 * ------------------------
 * This file previously attempted to start Nucleus through an older
 * runtime surface. It now delegates to the canonical startup path.
 */

export function startIntegrationHook() {
  return startNucleus();
}
