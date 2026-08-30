// src/nucleus/integrations/nucleusIntegration.ts

/**
 * NucleusIntegration (Phase 7.1)
 *
 * Purpose:
 *   Provide a stable integration surface for external systems:
 *     - emit contracts
 *     - retrieve lineage
 *     - finalize runs
 *     - access subsystem runtimes indirectly
 *
 *   This layer wraps NucleusApi and exposes a clean integration API.
 */

import { NucleusApi } from "../api/nucleusApi";

export class NucleusIntegration {
  private api: NucleusApi;

  constructor(
    subsystem: "weaver" | "guardian" | "glue" | "dualpay",
    organizationId: string
  ) {
    this.api = new NucleusApi(subsystem, organizationId);
  }

  /**
   * Emit a contract into the constitutional runtime.
   */
  emitContract(name: string, version: string, payload: any) {
    return this.api.emit(name, version, payload);
  }

  /**
   * Retrieve the last contract of a given type.
   */
  getLast(name: string) {
    return this.api.last(name);
  }

  /**
   * Retrieve full constitutional lineage.
   */
  getLineage() {
    return this.api.lineage();
  }

  /**
   * Finalize the constitutional run.
   */
  finalize() {
    return this.api.finalize();
  }

  /**
   * Expose underlying session (rarely needed).
   */
  session() {
    return this.api.getSession();
  }
}
