// Phase 30 — Full Stress Suite Runner

import { eventFlood } from "./eventFlood";
import { contractFlood } from "./contractFlood";
import { resourceHammer } from "./resourceHammer";
import { subsystemLoad } from "./subsystemLoad";

export async function runStressSuite() {
  console.log("🔵 Phase 30 — Stress Suite Starting...");

  await eventFlood(2000);
  await contractFlood(2000);
  await resourceHammer(1000);
  await subsystemLoad(1000);

  console.log("🟢 Phase 30 — Stress Suite Complete.");
}
