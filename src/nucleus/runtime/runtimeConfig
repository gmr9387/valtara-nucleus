// src/nucleus/runtime/runtimeConfig.ts

/**
 * RuntimeConfig (Phase 9.1)
 *
 * Purpose:
 *   Centralize tunable runtime settings:
 *     - batching
 *     - concurrency
 *     - timeouts
 *     - safety thresholds
 */

export interface RuntimeConfigOptions {
  maxBatchSize?: number;
  maxConcurrentEmits?: number;
  emitTimeoutMs?: number;
}

export class RuntimeConfig {
  private static defaults: Required<RuntimeConfigOptions> = {
    maxBatchSize: 100,
    maxConcurrentEmits: 8,
    emitTimeoutMs: 5_000,
  };

  static get() {
    return { ...this.defaults };
  }

  static update(opts: RuntimeConfigOptions) {
    this.defaults = { ...this.defaults, ...opts };
  }
}
