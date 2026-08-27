// src/nucleus/runtime/nucleusSession.ts

/**
 * NucleusSession (Phase 5.3)
 *
 * Purpose:
 *   Per-run constitutional session:
 *     - bind runtime
 *     - bind state
 *     - bind finalization
 */

import { NucleusRuntime } from "./nucleusRuntime";
import { NucleusState } from "./nucleusState";
import { NucleusFinalization } from "./nucleusFinalization";

export class NucleusSession {
  readonly runtime: NucleusRuntime;
  readonly state: NucleusState;
  readonly finalization: NucleusFinalization;

  constructor(subsystem: "weaver" | "guardian" | "glue" | "dualpay", organizationId: string) {
    this.runtime = new NucleusRuntime(subsystem, organizationId).boot();
    this.state = new NucleusState();
    this.finalization = new NucleusFinalization(this.state);
  }
}
