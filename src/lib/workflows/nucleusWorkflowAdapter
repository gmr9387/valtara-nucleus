// src/nucleus/workflows/nucleusWorkflowAdapter.ts
// Full file swap — Phase 14 workflow → Nucleus adapter

import { NucleusApi } from "../api/nucleusApi";

export class NucleusWorkflowAdapter {
  constructor(
    private organizationId: string,
    private supabaseUrl: string,
    private supabaseAnonKey: string
  ) {}

  async handleWorkflowEvent(event: {
    type: string;
    version: string;
    payload: any;
  }) {
    const subsystem = this.mapSubsystem(event.type);
    const api = new NucleusApi(subsystem, this.organizationId);

    await api.emit(event.type, event.version, event.payload);

    return api.lineage();
  }

  private mapSubsystem(type: string) {
    switch (type) {
      case "opportunity":
      case "recommendation":
        return "weaver";
      case "authorization":
        return "guardian";
      case "execution":
        return "glue";
      case "payment":
        return "dualpay";
      default:
        throw new Error(`Unknown workflow event type: ${type}`);
    }
  }
}
