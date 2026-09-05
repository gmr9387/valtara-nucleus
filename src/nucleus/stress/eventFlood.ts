// Phase 30 — Event Flood Test

import { nucleus } from "../runtime/nucleusRuntime";
import { stressIdentity } from "./stressIdentity";

export async function eventFlood(count: number = 1000) {
  console.log(`🔵 Event Flood: Emitting ${count} events...`);

  for (let i = 0; i < count; i++) {
    nucleus.weaver.discover(
      { index: i, message: "Stress event" },
      stressIdentity
    );
  }

  console.log("🟢 Event Flood Complete.");
}
