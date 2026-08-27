// src/nucleus/runtime/runtimePerformance.ts

/**
 * RuntimePerformance (Phase 9.2)
 *
 * Purpose:
 *   Lightweight perf hooks:
 *     - measure emit latency
 *     - measure batch latency
 *     - expose simple timing API
 */

export interface TimingSample {
  label: string;
  durationMs: number;
}

export class RuntimePerformance {
  private samples: TimingSample[] = [];

  time<T>(label: string, fn: () => T): T {
    const start = performance.now();
    const result = fn();
    const end = performance.now();

    this.samples.push({ label, durationMs: end - start });
    return result;
  }

  getSamples() {
    return [...this.samples];
  }

  clear() {
    this.samples = [];
  }
}
