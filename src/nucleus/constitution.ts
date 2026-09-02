// valtaris-nucleus/src/nucleus/constitution.ts

/**
 * Valtaris Nucleus Constitution
 * -----------------------------
 * Defines the immutable architectural principles and ordering
 * that govern the Nucleus runtime and subsystem pipeline.
 */

export const Constitution = {
  version: "1.0.0",

  principles: {
    opportunityFirst: true,
    guardianMandatory: true,
    glueAdaptive: true,
    dualPayReactive: true,
    telemetryUniversal: true,
    gatewayIngressRequired: true,
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

  describe() {
    return {
      version: this.version,
      principles: this.principles,
      ordering: this.ordering,
    };
  },
};
