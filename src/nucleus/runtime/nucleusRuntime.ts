// src/nucleus/runtime/nucleusRuntime.ts
// Full file — Authoritative Nucleus Runtime (Unified Orchestrator + Background Workers)

import { RuntimeHook } from "./runtimeHook";
import { RuntimeContext } from "./runtimeGuards";
import { ResourceService } from "../resources/resourceService";
import { NucleusDurableQueue } from "../ops/nucleusDurableQueue";
import { NucleusWorkerPool } from "../ops/nucleusWorkerPool";

export class NucleusRuntime {
  private ctx: RuntimeContext;
  private hook: RuntimeHook;
  private queue: NucleusDurableQueue<any>;
  private pool: NucleusWorkerPool;

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

    // Background runtime: durable queue + worker pool
    const workerCount = Number(process.env.NUCLEUS_WORKER_POOL_SIZE || 4);
    this.queue = new NucleusDurableQueue();
    this.pool = new NucleusWorkerPool(
      this.queue,
      workerCount,
      subsystem,
      organizationId
    );
  }

  /**
   * Boot the runtime.
   * Attaches the hook to the event bus and starts workers.
   */
  boot() {
    this.hook.attach();
    this.pool.start();
    return this;
  }

  /**
   * Enqueue a background job into the durable queue.
   */
  enqueue(type: string, version: string, payload: any) {
    this.queue.push({ type, version, payload });
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
