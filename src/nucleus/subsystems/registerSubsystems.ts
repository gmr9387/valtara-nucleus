// src/nucleus/subsystems/registerSubsystems.ts
// Full file — Updated with Contract Subsystem Registration

import { SubsystemRegistry } from "./subsystemRegistry";

export function registerSubsystems() {
  return {
    // ----------------------------------------
    // Constitutional Subsystems
    // ----------------------------------------
    weaver: SubsystemRegistry.weaver,
    guardian: SubsystemRegistry.guardian,
    glue: SubsystemRegistry.glue,
    dualpay: SubsystemRegistry.dualpay,

    // ----------------------------------------
    // Contract Subsystems (NEW)
    // ----------------------------------------
    opportunity: SubsystemRegistry.opportunity,
    recommendation: SubsystemRegistry.recommendation,
    authorization: SubsystemRegistry.authorization,
    execution: SubsystemRegistry.execution,
    payment: SubsystemRegistry.payment,
  };
}
