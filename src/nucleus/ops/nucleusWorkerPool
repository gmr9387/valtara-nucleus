// src/nucleus/ops/nucleusWorkerPool.ts
// Full file — Worker pool for concurrency

import { NucleusWorker } from "./nucleusWorker";
import { NucleusQueue } from "./nucleusQueue";

export class NucleusWorkerPool {
  private workers: NucleusWorker[] = [];

  constructor(
    private queue: NucleusQueue<any>,
    private size: number,
    private subsystem: string,
    private organizationId: string
  ) {}

  start() {
    for (let i = 0; i < this.size; i++) {
      const worker = new NucleusWorker(
        this.queue,
        this.subsystem,
        this.organizationId
      );
      worker.start();
      this.workers.push(worker);
    }
  }

  stop() {
    for (const worker of this.workers) {
      worker.stop();
    }
  }
}
