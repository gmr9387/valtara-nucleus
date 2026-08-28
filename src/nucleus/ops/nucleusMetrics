// src/nucleus/ops/nucleusMetrics.ts

/**
 * NucleusMetrics (Phase 11.1)
 *
 * Purpose:
 *   Collect runtime metrics:
 *     - emit counts
 *     - error counts
 *     - queue size
 *     - worker activity
 */

export class NucleusMetrics {
  private counters: Record<string, number> = {};

  inc(label: string) {
    this.counters[label] = (this.counters[label] || 0) + 1;
  }

  get(label: string) {
    return this.counters[label] || 0;
  }

  all() {
    return { ...this.counters };
  }
}
