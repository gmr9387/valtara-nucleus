// valtaris-nucleus/src/nucleus/integrations/runtime.ts

/**
 * Integration Runtime
 * -------------------
 * This file previously referenced masterBoot.ts, which no longer exists.
 * The correct boot surface is nucleusBoot.ts inside the runtime directory.
 */

import { nucleusBoot } from "../runtime/nucleusBoot";

export function startIntegrationRuntime() {
  return nucleusBoot();
}
