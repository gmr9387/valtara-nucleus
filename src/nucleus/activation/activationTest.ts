// Phase 28 — First Activation Test

import { nucleus } from "../runtime/nucleusRuntime";
import { activationIdentity } from "./activationIdentity";

export async function runActivationTest() {
  console.log("🔵 Phase 28 — Activation Test Starting...");

  // 1. Create a resource
  const resource = nucleus.resources.createResource(
    "activation-resource",
    "ActivationResource",
    {
      tenantId: activationIdentity.tenantId,
      environmentId: activationIdentity.environmentId,
      projectId: activationIdentity.projectId,
      subsystem: "weaver",
      capability: "discover",
      actorId: activationIdentity.actorId,
    },
    { status: "initial" }
  );

  console.log("🟢 Resource created:", resource);

  // 2. Emit first event
  const event = nucleus.weaver.discover(
    { message: "Activation event fired" },
    activationIdentity
  );

  console.log("🟢 Event emitted:", event);

  // 3. Mutate resource through event payload
  const mutationEvent = nucleus.weaver.evaluate(
    {
      resourceId: "activation-resource",
      mutate: (data: any) => ({ ...data, status: "evaluated" }),
    },
    activationIdentity
  );

  console.log("🟢 Resource mutated via event:", mutationEvent);

  // 4. Emit first contract
  const contractEvent = nucleus.weaver.propose(
    { proposal: "Activation proposal" },
    activationIdentity
  );

  console.log("🟢 Contract emitted:", contractEvent);

  // 5. Lineage check
  const lineage = nucleus.lineage.recordEvent(event);
  console.log("🟢 Lineage recorded");

  // 6. Telemetry check
  nucleus.telemetry.recordEvent(event, 12);
  console.log("🟢 Telemetry recorded");

  // 7. State snapshot
  const snapshot = {
    resources: nucleus.resources.listResources(),
    lineage: nucleus.lineage.list(),
    telemetry: nucleus.telemetry.list(),
  };

  console.log("🟢 State snapshot:", snapshot);

  console.log("🔵 Phase 28 — Activation Test Complete.");
}
