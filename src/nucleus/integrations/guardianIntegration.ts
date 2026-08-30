// src/nucleus/integrations/guardianIntegration.ts

import { NucleusIntegration } from "./nucleusIntegration";

export class GuardianIntegration {
  private nucleus: NucleusIntegration;

  constructor(organizationId: string) {
    this.nucleus = new NucleusIntegration("guardian", organizationId);
  }

  emitAuthorization(version: string, payload: any) {
    return this.nucleus.emitContract("authorization", version, payload);
  }

  lineage() {
    return this.nucleus.getLineage();
  }

  finalize() {
    return this.nucleus.finalize();
  }
}
