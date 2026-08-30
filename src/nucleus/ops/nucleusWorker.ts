// src/nucleus/ops/nucleusWorker.ts
// Full file — Worker that processes queue items

import { NucleusQueue } from "./nucleusQueue";
import { NucleusApi } from "../api/nucleusApi";

export class NucleusWorker {
  private running = false;

  constructor(
    private queue: NucleusQueue<any>,
    private subsystem: string,
    private organizationId: string
  ) {}

  start() {
    this.running = true;
    this.loop();
  }

  stop() {
    this.running = false;
  }

  private async loop() {
    while (this.running) {
      const item = this.queue.pop();
      if (!item) {
        await this.sleep(50);
        continue;
      }

      try {
        const api = new NucleusApi(this.subsystem, this.organizationId);
        await api.emit(item.type, item.version, item.payload);
      } catch (err) {
        console.error("Worker error:", err);
      }
    }
  }

  private sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
