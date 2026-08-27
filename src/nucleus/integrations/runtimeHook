// src/nucleus/integrations/runtimeHook.ts

/**
 * Nucleus Runtime Hook
 *
 * This file allows your application server (Bun, Node, Vite, Wrangler, etc.)
 * to automatically start the Nucleus runtime when the server boots.
 *
 * It simply imports and calls startNucleus().
 */

import { startNucleus } from "./runtime";

export function attachNucleusRuntime() {
  console.log("=== [Nucleus] Attaching Runtime Hook ===");
  startNucleus();
  console.log("=== [Nucleus] Runtime Hook Attached ===");
}
