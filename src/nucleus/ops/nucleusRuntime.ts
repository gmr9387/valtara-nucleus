// src/nucleus/ops/nucleusRuntime.ts
// Corrected Full File — Unified Nucleus Runtime

import { NucleusTelemetryAdapter } from "../telemetry/nucleusTelemetryAdapter";
import { NucleusDBBridge } from "../db/nucleusDbBridge";

export class NucleusRuntime {
  private telemetry: NucleusTelemetryAdapter;
  private db: NucleusDBBridge;
  private queue: any[] = [];
  private running = false;

  constructor(private subsystem: string, private organizationId: string) {
    this.telemetry = new NucleusTelemetryAdapter(organizationId, subsystem);
    this.db = new NucleusDBBridge(organizationId, subsystem);
  }

  // -----------------------------
  // Unified Start (Constitution + Server)
  // -----------------------------
  start() {
    if (this.running) return;

    this.running = true;
    this.telemetry.info("Runtime started", {
      subsystem: this.subsystem,
      organizationId: this.organizationId,
    });

    this.loop();
  }

  // -----------------------------
  // Background Loop
  // -----------------------------
  private async loop() {
    while (this.running) {
      const job = this.queue.shift();

      if (job) {
        const span = this.telemetry.startSpan(`runtime:${job.type}`);

        try {
          await this.db.insertEvent(
            this.organizationId,
            this.subsystem,
            job.type,
            job.version,
            job.payload
          );

          await this.telemetry.info("Runtime job processed", {
            type: job.type,
            version: job.version,
          });
        } catch (err) {
          await this.telemetry.error("Runtime job failed", { error: err });
        } finally {
          this.telemetry.endSpan(span.spanId);
        }
      }

      await new Promise((resolve) => setTimeout(resolve, 10));
    }
  }

  // -----------------------------
  // Enqueue Work
  // -----------------------------
  enqueue(type: string, version: string, payload: any) {
    this.queue.push({ type, version, payload });
    this.telemetry.debug("Runtime job enqueued", { type, version });
  }

  // -----------------------------
  // Stop Runtime
  // -----------------------------
  stop() {
    this.running = false;
    this.telemetry.warn("Runtime stopped", {
      subsystem: this.subsystem,
      organizationId: this.organizationId,
    });
  }
}
