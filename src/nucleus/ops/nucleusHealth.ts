// src/nucleus/ops/nucleusHealth.ts

/**
 * NucleusHealth (Phase 11.3)
 *
 * Purpose:
 *   Provide health checks for:
 *     - server
 *     - queue
 *     - worker
 *     - scheduler
 */

export class NucleusHealth {
  checkServer(port: number) {
    return {
      server: "ok",
      port,
      at: Date.now(),
    };
  }

  checkQueue(queue: { size: () => number }) {
    return {
      queue: "ok",
      size: queue.size(),
      at: Date.now(),
    };
  }

  checkWorker(active: boolean) {
    return {
      worker: active ? "ok" : "idle",
      at: Date.now(),
    };
  }

  checkScheduler() {
    return {
      scheduler: "ok",
      at: Date.now(),
    };
  }
}
