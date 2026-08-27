// src/nucleus/integrations/dualPayIntegration.ts

import { NucleusIntegration } from "./nucleusIntegration";

export class DualPayIntegration {
  private nucleus: NucleusIntegration;

  constructor(organizationId: string) {
    this.nucleus = new NucleusIntegration("dualpay", organizationId);
  }

  emitPayment(version: string, payload: any) {
    return this.nucleus.emitContract("payment", version, payload);
  }

  lineage() {
    return this.nucleus.getLineage();
  }

  finalize() {
    return this.nucleus.finalize();
  }
}
