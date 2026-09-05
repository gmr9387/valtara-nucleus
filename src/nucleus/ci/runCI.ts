// Phase 44 — CI Entry Point

import { ciRunner } from "./ciRunner";

export async function runCI() {
  console.log("🔵 Phase 44 — Sovereign CI Starting...");
  const result = await ciRunner.run();
  console.log("🟢 CI complete:", result);
  console.log("🔵 Phase 44 — Sovereign CI Finished.");
  return result;
}
