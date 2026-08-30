// src/nucleus/ops/nucleusDurableQueue.ts
// Full file — Durable queue persisted to disk

import { NucleusQueue } from "./nucleusQueue";
import fs from "node:fs";
import path from "node:path";

export class NucleusDurableQueue<T> extends NucleusQueue<T> {
  private filePath: string;

  constructor(filename = "nucleus-queue.json") {
    super();
    this.filePath = path.join(process.cwd(), filename);
    this.load();
  }

  override push(item: T) {
    super.push(item);
    this.persist();
  }

  override pop(): T | undefined {
    const item = super.pop();
    this.persist();
    return item;
  }

  private load() {
    if (!fs.existsSync(this.filePath)) return;
    try {
      const raw = fs.readFileSync(this.filePath, "utf-8");
      const data = JSON.parse(raw);
      if (Array.isArray(data)) {
        this.q = data;
      }
    } catch {
      // ignore corrupted queue
    }
  }

  private persist() {
    fs.writeFileSync(this.filePath, JSON.stringify(this.q));
  }
}
