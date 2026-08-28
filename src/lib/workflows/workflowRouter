// Phase 14.3 — WorkflowRouter
// Decides which subsystem handles each workflow event

export class WorkflowRouter {
  route(event) {
    switch (event.type) {
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
        throw new Error(`Unknown workflow event type: ${event.type}`);
    }
  }
}
