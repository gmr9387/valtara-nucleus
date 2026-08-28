// src/nucleus/ops/nucleusScheduler.ts

/**
 * NucleusScheduler (Phase 10.4)
 *
 * Purpose:
 *   Schedule periodic tasks.
 */

export class NucleusScheduler {
  schedule(label: string, intervalMs: number, fn: () => void) {
    setInterval(() => {
      fn();
    }, intervalMs);
  }
}
