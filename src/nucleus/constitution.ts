// src/nucleus/constitution/constitution.ts

/**
 * Valtaris OS Constitution (Phase 25)
 *
 * Defines the immutable rules that govern the OS pipeline.
 * Subsystems may evolve, but the Constitution does not change.
 */

export const Constitution = {
  version: "1.0.0",

  principles: {
    opportunityFirst: true, // Weaver always runs first
    guardianMandatory: true, // Authorization is required
    glueAdaptive: true, // Glue must adapt based on signals
    dualPayReactive: true, // Payment reacts to execution + signals
    telemetryUniversal: true, // All subsystems emit telemetry
    gatewayIngressRequired: true, // External requests must enter via Gateway
  },

  ordering: [
    "gateway",
    "weaver.opportunity",
    "weaver.recommendation",
    "guardian.authorization",
    "glue.execution",
    "dualpay.payment",
    "telemetry",
  ],

  validateOrdering() {
    return this.ordering;
  },

  describe() {
    return {
      version: this.version,
      principles: this.principles,
      ordering: this.ordering,
    };
  },
};
