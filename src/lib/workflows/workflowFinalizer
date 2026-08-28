// Phase 14.4 — WorkflowFinalizer
// Calls Nucleus finalization after workflow completion

import { NucleusApi } from "../api/nucleusApi";

export class WorkflowFinalizer {
  constructor(private organizationId: string) {}

  finalize() {
    const api = new NucleusApi("dualpay", this.organizationId);
    return api.finalize();
  }
}
