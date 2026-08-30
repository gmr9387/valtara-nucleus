// src/nucleus/runtime/runtimeHook.ts

/**
 * Runtime Hook (Phase 3.3)
 *
 * Purpose:
 *   Attach the RuntimeRouter to:
 *     - eventBus
 *     - subsystem emitters
 *     - orchestrationRouter
 *     - NucleusBoot
 *
 * This ensures ALL contract emissions pass through
 * constitutional runtime enforcement.
 */

import { eventBus } from "../events/eventBus";
import { RuntimeRouter } from "./runtimeRouter";
import { RuntimeContext } from "./runtimeGuards";

export class RuntimeHook {
  private router: RuntimeRouter;

  constructor(private ctx: RuntimeContext) {
    this.router = new RuntimeRouter(ctx);
  }

  /**
   * Attach runtime enforcement to the event bus.
   *
   * Every subsystem emits events like:
   *   - "opportunity.created"
   *   - "recommendation.created"
   *   - "authorization.created"
   *   - "execution.created"
   *   - "payment.created"
   *
   * This hook intercepts them and routes through RuntimeRouter.
   */
  attach() {
    eventBus.on("contract.emit", (contract) => {
      const { name, version, payload } = contract;

      // Constitutional enforcement
      this.router.dispatch(name, version, payload);

      // If dispatch succeeds, forward event downstream
      eventBus.emit(`contract.validated.${name}`, payload);
    });

    // Optional: attach subsystem-specific hooks
    this.attachSubsystemHooks();
  }

  /**
   * Attach hooks for subsystem emitters.
   *
   * Example:
   *   weaverRuntime.emit("opportunity", payload)
   *   → becomes eventBus.emit("contract.emit", { name, version, payload })
   */
  private attachSubsystemHooks() {
    const subsystems = ["weaver", "guardian", "glue", "dualpay"];

    for (const subsystem of subsystems) {
      eventBus.on(`${subsystem}.emit`, (contract) => {
        const { name, version, payload } = contract;

        // Enforce subsystem identity
        if (this.ctx.subsystem !== subsystem) {
          throw new Error(
            `Subsystem identity violation: expected ${subsystem}, got ${this.ctx.subsystem}`
          );
        }

        // Route through constitutional runtime
        this.router.dispatch(name, version, payload);

        // Forward validated contract
        eventBus.emit(`contract.validated.${name}`, payload);
      });
    }
  }
}
