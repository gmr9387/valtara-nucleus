// src/nucleus/ops/nucleusQueue.ts
// Full file — Basic in-memory queue

export class NucleusQueue<T> {
  protected q: T[] = [];

  push(item: T) {
    this.q.push(item);
  }

  pop(): T | undefined {
    return this.q.shift();
  }

  size() {
    return this.q.length;
  }

  isEmpty() {
    return this.q.length === 0;
  }
}
