// Phase 14.1 — NucleusWorkflowAdapter
// Maps workflow engine events → constitutional contracts

import { NucleusApi } from "../api/nucleusApi";

export class NucleusWorkflowAdapter {
  constructor(
    private organizationId: "bpqukcsaoporhvdtfyza",
    private supabaseUrl: "https://bpqukcsaoporhvdtfyza.supabase.co",
    private supabaseKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwcXVrY3Nhb3Bvcmh2ZHRmeXphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc5Mjk1MTYsImV4cCI6MjEwMzUwNTUxNn0.IVIepvpXkL0M69UjZguWF3MLpcHhFmjOJmJKvPbTn8I"
  ) {}

  async handleWorkflowEvent(event: {
    type: string;
    version: string;
    payload: any;
  }) {
    const subsystem = this.mapSubsystem(event.type);
    const api = new NucleusApi(subsystem, this.organizationId);

    // Emit into constitutional runtime
    api.emit(event.type, event.version, event.payload);

    // Return lineage + finalization state
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
