// src/nucleus/runtime/nucleusBoot.ts

/**
 * NucleusBoot (Phase 3.5)
 *
 * Purpose:
 *   Final initializer for the constitutional runtime.
 *
 * Responsibilities:
 *     - instantiate NucleusRuntime
 *     - attach runtimeHook
 *     - bind subsystem runtimes
 *     - bind orchestrationRouter
 *     - bind eventBus
 *     - expose unified runtime API
 */

import { NucleusRuntime } from "./nucleusRuntime";
import { eventBus } from "../events/eventBus";
import { orchestrationRouter } from "../events/orchestrationRouter";

export class NucleusBoot {
  private runtime: NucleusRuntime;

  constructor(
    private subsystem: "weaver" | "guardian" | "glue" | "dualpay",
    private organizationId: string
  ) {
    this.runtime = new NucleusRuntime(subsystem, organizationId);
  }

  /**
   * Boot the constitutional runtime.
   */
  boot() {
    // Attach runtimeHook → enforces constitution on all events
    this.runtime.boot();

    // Bind orchestration router to eventBus
    this.attachOrchestration();

    // Bind subsystem runtime handlers
    this.attachSubsystemRuntime();

    return this.runtime;
  }

  /**
   * Attach orchestration router to eventBus.
   */
  private attachOrchestration() {
    eventBus.on("contract.validated.opportunity", (payload) => {
      orchestrationRouter.route("opportunity", payload);
    });

    eventBus.on("contract.validated.recommendation", (payload) => {
      orchestrationRouter.route("recommendation", payload);
    });

    eventBus.on("contract.validated.authorization", (payload) => {
      orchestrationRouter.route("authorization", payload);
    });

    eventBus.on("contract.validated.execution", (payload) => {
      orchestrationRouter.route("execution", payload);
    });

    eventBus.on("contract.validated.payment", (payload) => {
      orchestrationRouter.route("payment", payload);
    });
  }

  /**
   * Attach subsystem runtime handlers.
   *
   * Example:
   *   weaverRuntime.handle("opportunity", payload)
   */
  private attachSubsystemRuntime() {
    const subsystemRuntimeMap: Record<string, any> = {
      weaver: require("../subsystems/weaver/weaverRuntime").WeaverRuntime,
      guardian: require("../subsystems/guardian/guardianRuntime").GuardianRuntime,
      glue: require("../subsystems/glue/glueRuntime").GlueRuntime,
      dualpay: require("../subsystems/dualpay/dualPayRuntime").DualPayRuntime,
    };

    const runtime = subsystemRuntimeMap[this.subsystem];

    eventBus.on(`contract.validated.${this.subsystem}`, (payload) => {
      runtime.handle(payload);
    });
  }
}
