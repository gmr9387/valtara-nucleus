// src/nucleus/subsystems/subsystemRegistry.ts
// Full file — Updated with Contract Subsystem Family

export const SubsystemRegistry = {
  // ----------------------------------------
  // Constitutional Subsystems
  // ----------------------------------------
  weaver: {
    key: "weaver",
    description: "Weaver subsystem — intelligence orchestration",
  },

  guardian: {
    key: "guardian",
    description: "Guardian subsystem — policy enforcement",
  },

  glue: {
    key: "glue",
    description: "Glue subsystem — integration and binding",
  },

  dualpay: {
    key: "dualpay",
    description: "DualPay subsystem — payment orchestration",
  },

  // ----------------------------------------
  // Contract Subsystems (NEW)
  // ----------------------------------------
  opportunity: {
    key: "opportunity",
    description: "Opportunity contract subsystem",
  },

  recommendation: {
    key: "recommendation",
    description: "Recommendation contract subsystem",
  },

  authorization: {
    key: "authorization",
    description: "Authorization contract subsystem",
  },

  execution: {
    key: "execution",
    description: "Execution contract subsystem",
  },

  payment: {
    key: "payment",
    description: "Payment contract subsystem",
  },
};
