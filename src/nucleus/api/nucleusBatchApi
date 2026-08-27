// src/nucleus/api/nucleusBatchApi.ts

/**
 * NucleusBatchApi (Phase 9.3)
 *
 * Purpose:
 *   Batch contract emission under constitutional constraints.
 */

import { NucleusApi } from "./nucleusApi";
import { RuntimeConfig } from "../runtime/runtimeConfig";
import { RuntimePerformance } from "../runtime/runtimePerformance";

export class NucleusBatchApi {
  private perf = new RuntimePerformance();

  constructor(
    private subsystem: "weaver" | "guardian" | "glue" | "dualpay",
    private organizationId: string
  ) {}

  emitBatch(contracts: { name: string; version: string; payload: any }[]) {
    const cfg = RuntimeConfig.get();
    if (contracts.length > cfg.maxBatchSize) {
      throw new Error(
        `Batch too large: ${contracts.length} > ${cfg.maxBatchSize}`
      );
    }

    const api = new NucleusApi(this.subsystem, this.organizationId);

    return this.perf.time("batch.emit", () => {
      for (const c of contracts) {
        api.emit(c.name, c.version, c.payload);
      }
      return { ok: true };
    });
  }

  metrics() {
    return this.perf.getSamples();
  }
}
