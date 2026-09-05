// Phase 26 — Contract Definition

export interface ContractDefinition {
  name: string;
  version: string;

  subsystem: "weaver" | "guardian" | "glue" | "dualpay";
  capability: string;

  resources: string[];

  validatePayload?: (payload: unknown) => boolean;
}
