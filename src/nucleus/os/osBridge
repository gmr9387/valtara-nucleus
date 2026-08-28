// src/nucleus/os/osBridge.ts

/**
 * OSBridge (Phase 12.1)
 *
 * Purpose:
 *   Provide a unified bridge for OS apps (Guardian, Weaver, Glue, DualPay)
 *   to communicate with the Nucleus constitutional runtime.
 *
 *   This layer:
 *     - validates OS → Nucleus requests
 *     - routes to correct subsystem integration
 *     - ensures organizationId consistency
 */

import {
  WeaverIntegration,
  GuardianIntegration,
  GlueIntegration,
  DualPayIntegration,
} from "../integrations";

export class OSBridge {
  private weaver: WeaverIntegration;
  private guardian: GuardianIntegration;
  private glue: GlueIntegration;
  private dualpay: DualPayIntegration;

  constructor(private organizationId: string) {
    this.weaver = new WeaverIntegration(organizationId);
    this.guardian = new GuardianIntegration(organizationId);
    this.glue = new GlueIntegration(organizationId);
    this.dualpay = new DualPayIntegration(organizationId);
  }

  // Weaver OS → Nucleus
  emitOpportunity(version: string, payload: any) {
    return this.weaver.emitOpportunity(version, payload);
  }

  emitRecommendation(version: string, payload: any) {
    return this.weaver.emitRecommendation(version, payload);
  }

  // Guardian OS → Nucleus
  emitAuthorization(version: string, payload: any) {
    return this.guardian.emitAuthorization(version, payload);
  }

  // Glue OS → Nucleus
  emitExecution(version: string, payload: any) {
    return this.glue.emitExecution(version, payload);
  }

  // DualPay OS → Nucleus
  emitPayment(version: string, payload: any) {
    return this.dualpay.emitPayment(version, payload);
  }

  // Shared lineage + finalization
  lineage() {
    return {
      weaver: this.weaver.lineage(),
      guardian: this.guardian.lineage(),
      glue: this.glue.lineage(),
      dualpay: this.dualpay.lineage(),
    };
  }

  finalize() {
    return {
      weaver: this.weaver.finalize(),
      guardian: this.guardian.finalize(),
      glue: this.glue.finalize(),
      dualpay: this.dualpay.finalize(),
    };
  }
}
