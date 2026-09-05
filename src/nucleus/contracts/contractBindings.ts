// Phase 26 — Contract Bindings (Weaver, Guardian, Glue, DualPay)

import { registerContract } from "./contractRegistry";

// Weaver
registerContract({
  name: "OpportunityProposed",
  version: "1.0.0",
  subsystem: "weaver",
  capability: "propose",
  resources: ["OpportunityResource"],
});

// Guardian
registerContract({
  name: "AuthorizationRequested",
  version: "1.0.0",
  subsystem: "guardian",
  capability: "authorize",
  resources: ["AuthorizationResource"],
});

// Glue
registerContract({
  name: "WorkflowBound",
  version: "1.0.0",
  subsystem: "glue",
  capability: "bind",
  resources: ["WorkflowResource"],
});

// DualPay
registerContract({
  name: "PaymentInitiated",
  version: "1.0.0",
  subsystem: "dualpay",
  capability: "charge",
  resources: ["PaymentResource"],
});
