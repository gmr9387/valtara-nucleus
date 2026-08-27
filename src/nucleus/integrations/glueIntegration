// src/nucleus/integrations/glueIntegration.ts

import { NucleusIntegration } from "./nucleusIntegration";

export class GlueIntegration {
  private nucleus: NucleusIntegration;

  constructor(organizationId: string) {
    this.nucleus = new NucleusIntegration("glue", organizationId);
  }

  emitExecution(version: string, payload: any) {
    return this.nucleus.emitContract("execution", version, payload);
  }

  lineage() {
    return this.nucleus.getLineage();
  }

  finalize() {
    return this.nucleus.finalize();
  }
}
