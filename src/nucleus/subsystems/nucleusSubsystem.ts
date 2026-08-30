// src/nucleus/subsystems/nucleusSubsystemRouter.ts
// Full file — Unified constitutional subsystem router

import { WeaverRuntime } from "./weaverRuntime";
import { GuardianRuntime } from "./guardianRuntime";
import { GlueRuntime } from "./glueRuntime";
import { DualPayRuntime } from "./dualpayRuntime";

export class NucleusSubsystemRouter {
  private weaver: WeaverRuntime;
  private guardian: GuardianRuntime;
  private glue: GlueRuntime;
  private dualpay: DualPayRuntime;

  constructor(private organizationId: string) {
    this.weaver = new WeaverRuntime(organizationId);
    this.guardian = new GuardianRuntime(organizationId);
    this.glue = new GlueRuntime(organizationId);
    this.dualpay = new DualPayRuntime(organizationId);
  }

  async dispatch(type: string, version: string, payload: any) {
    switch (type) {
      case "opportunity":
        return this.weaver.opportunity(version, payload);
      case "recommendation":
        return this.weaver.recommendation(version, payload);
      case "authorization":
        return this.guardian.authorization(version, payload);
      case "execution":
        return this.glue.execution(version, payload);
      case "payment":
        return this.dualpay.payment(version, payload);
      default:
        throw new Error(`Unknown subsystem event type: ${type}`);
    }
  }
}
