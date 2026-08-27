// src/nucleus/runtime/nucleusState.ts

/**
 * NucleusState (Phase 5.1)
 *
 * Purpose:
 *   Track constitutional runtime state:
 *     - last contracts
 *     - lineage snapshots
 *     - replay safety
 */

export interface ContractSnapshot {
  name: string;
  version: string;
  payload: any;
  at: number;
}

export class NucleusState {
  private history: ContractSnapshot[] = [];

  record(name: string, version: string, payload: any) {
    this.history.push({
      name,
      version,
      payload,
      at: Date.now(),
    });
  }

  last(name: string) {
    for (let i = this.history.length - 1; i >= 0; i--) {
      if (this.history[i].name === name) return this.history[i];
    }
    return undefined;
  }

  all() {
    return [...this.history];
  }
}
