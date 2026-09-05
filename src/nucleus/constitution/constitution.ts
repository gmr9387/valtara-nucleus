// Phase 34 — Nucleus Constitution v1.0

export interface ConstitutionalSubsystem {
  name: string;
  capabilities: string[];
}

export interface ConstitutionalContract {
  name: string;
  version: string;
  subsystem: string;
  capability: string;
  resources: string[];
}

export interface ConstitutionalResource {
  type: string;
  subsystem: string;
  capability: string;
}

export interface ConstitutionalIdentityBoundary {
  tenant: boolean;
  environment: boolean;
  project: boolean;
  subsystem: boolean;
  capability: boolean;
  actor: boolean;
}

export interface NucleusConstitution {
  version: string;

  subsystems: ConstitutionalSubsystem[];
  contracts: ConstitutionalContract[];
  resources: ConstitutionalResource[];

  identityBoundary: ConstitutionalIdentityBoundary;

  description: string;
}

export const constitution: NucleusConstitution = {
  version: "1.0.0",

  description:
    "The Nucleus Constitution defines the identity boundaries, subsystem capabilities, contract bindings, resource bindings, and enforcement rules that govern the Valtaris Nucleus runtime.",

  subsystems: [
    { name: "weaver", capabilities: ["discover", "evaluate", "propose"] },
    { name: "guardian", capabilities: ["authorize", "validate", "guard"] },
    { name: "glue", capabilities: ["bind", "orchestrate", "coordinate"] },
    { name: "dualpay", capabilities: ["charge", "settle", "reconcile"] },
  ],

  contracts: [
    {
      name: "OpportunityProposed",
      version: "1.0.0",
      subsystem: "weaver",
      capability: "propose",
      resources: ["OpportunityResource"],
    },
    {
      name: "AuthorizationRequested",
      version: "1.0.0",
      subsystem: "guardian",
      capability: "authorize",
      resources: ["AuthorizationResource"],
    },
    {
      name: "WorkflowBound",
      version: "1.0.0",
      subsystem: "glue",
      capability: "bind",
      resources: ["WorkflowResource"],
    },
    {
      name: "PaymentInitiated",
      version: "1.0.0",
      subsystem: "dualpay",
      capability: "charge",
      resources: ["PaymentResource"],
    },
  ],

  resources: [
    { type: "OpportunityResource", subsystem: "weaver", capability: "discover" },
    { type: "AuthorizationResource", subsystem: "guardian", capability: "authorize" },
    { type: "WorkflowResource", subsystem: "glue", capability: "bind" },
    { type: "PaymentResource", subsystem: "dualpay", capability: "charge" },
  ],

  identityBoundary: {
    tenant: true,
    environment: true,
    project: true,
    subsystem: true,
    capability: true,
    actor: true,
  },
};
