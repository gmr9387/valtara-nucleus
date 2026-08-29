// src/nucleus/ops/nucleusRuntime.ts
// Full file — Unified Nucleus background runtime

import { NucleusDurableQueue } from "./nucleusDurableQueue";
import { NucleusWorkerPool } from "./nucleusWorkerPool";

export class NucleusRuntime {
  private queue: NucleusDurableQueue<any>;
  private pool: NucleusWorkerPool;

  constructor(
    private subsystem: string,
    private organizationId: string,
    private workerCount: number = Number(
      process.env.NUCLEUS_WORKER_POOL_SIZE || 4
    )
  ) {
    this.queue = new NucleusDurableQueue();
    this.pool = new NucleusWorkerPool(
      this.queue,
      this.workerCount,
      this.subsystem,
      this.organizationId
    );
  }

  start() {
    this.pool.start();
  }

  enqueue(type: string, version: string, payload: any) {
    this.queue.push({ type, version, payload });
  }
}
