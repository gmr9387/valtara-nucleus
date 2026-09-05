// Phase 42 — Pipeline Runner

import { constitutionalPipeline } from "./constitutionalPipeline";

export async function runPipeline() {
  console.log("🔵 Phase 42 — Constitutional Pipeline Starting...");
  const result = await constitutionalPipeline.execute();
  console.log("🟢 Pipeline complete:", result);
  console.log("🔵 Phase 42 — Constitutional Pipeline Finished.");
  return result;
}
