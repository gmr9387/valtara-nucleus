// Phase 23 — State Engine

import { NucleusEvent } from "../events/nucleusEvent";
import { resourceGraph } from "../resources/resourceGraph";
import { lineageEngine } from "../lineage/lineageEngine";
import { telemetryEngine } from "../telemetry/telemetryEngine";
import { stateStore } from "./stateStore";
import { ResourceIdentity } from "../resources/resourceIdentity";

export class StateEngine {
  applyEvent(event: NucleusEvent) {
    const ctx = event.context;

    // 1. Resource mutation (if applicable)
    if (event.payload && typeof event.payload === "object") {
      const payload = event.payload as any;

      if (payload.resourceId && payload.mutate) {
        const identity: ResourceIdentity = {
          tenantId: ctx.tenantId,
          environmentId: ctx.environmentId,
          projectId: ctx.projectId,
          subsystem: ctx.subsystem,
          capability: ctx.capability,
          actorId: ctx.actorId,
        };

        const updated = resourceGraph.mutateResource(
          payload.resourceId,
          identity,
          payload.mutate
        );

        stateStore.addResource(updated);

        lineageEngine.recordEvent(
          event,
          updated.id,
          updated.type
        );
      }
    }

    // 2. Lineage (always)
    lineageEngine.recordEvent(event);

    // 3. Telemetry (always)
    telemetryEngine.recordEvent(event);

    // 4. State store snapshot
    // (We store lineage + telemetry entries as they come in)
  }
}

export const stateEngine = new StateEngine();
