// src/nucleus/runtime/nucleusRuntime.ts

/**
 * Nucleus Runtime (Phase 3.4)
 *
 * Purpose:
 *   Unified runtime orchestrator that:
 *     - boots the runtime
 *     - attaches runtimeHook
 *     - binds subsystem runtimes
 *     - binds resource service
 *     - exposes constitutional runtime API
 */

import { RuntimeHook } from "./runtimeHook";
import { RuntimeContext } from "./runtimeGuards";
import { ResourceService } from "../resources/resourceService";

export class NucleusRuntime {
  private ctx: RuntimeContext;
  private hook: RuntimeHook;

  constructor(subsystem: RuntimeContext["subsystem"], organizationId: string) {
    // Bind resource service
    const resources = new ResourceService();

    // Build runtime context
    this.ctx = {
      subsystem,
      organizationId,
      resources,
    };

    // Attach runtime hook
    this.hook = new RuntimeHook(this.ctx);
  }

  /**
   * Boot the runtime.
   * Attaches the hook to the event bus.
   */
  boot() {
    this.hook.attach();
    return this;
  }

  /**
   * Expose resource service for subsystem use.
   */
  resources() {
    return this.ctx.resources;
  }

  /**
   * Expose subsystem identity.
   */
  subsystem() {
    return this.ctx.subsystem;
  }

  /**
   * Expose organization context.
   */
  organization() {
    return this.ctx.organizationId;
  }
}
