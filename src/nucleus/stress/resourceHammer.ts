// Phase 30 — Resource Hammer Test

import { nucleus } from "../runtime/nucleusRuntime";
import { stressIdentity } from "./stressIdentity";

export async function resourceHammer(count: number = 500) {
  console.log(`🔵 Resource Hammer: Mutating resource ${count} times...`);

  nucleus.resources.createResource(
    "stress-resource",
    "StressResource",
    {
      tenantId: stressIdentity.tenantId,
      environmentId: stressIdentity.environmentId,
      projectId: stressIdentity.projectId,
      subsystem: "weaver",
      capability: "discover",
      actorId: stressIdentity.actorId,
    },
    { hits: 0 }
  );

  for (let i = 0; i < count; i++) {
    nucleus.weaver.evaluate(
      {
        resourceId: "stress-resource",
        mutate: (data: any) => ({ ...data, hits: data.hits + 1 }),
      },
      stressIdentity
    );
  }

  console.log("🟢 Resource Hammer Complete.");
}
