// Phase 30 — Contract Flood Test

import { nucleus } from "../runtime/nucleusRuntime";
import { stressIdentity } from "./stressIdentity";

export async function contractFlood(count: number = 1000) {
  console.log(`🔵 Contract Flood: Emitting ${count} contracts...`);

  for (let i = 0; i < count; i++) {
    nucleus.weaver.propose(
      { index: i, proposal: "Stress proposal" },
      { ...stressIdentity, capability: "propose" }
    );
  }

  console.log("🟢 Contract Flood Complete.");
}
