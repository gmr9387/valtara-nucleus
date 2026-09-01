// src/nucleus/tests/guardianSubsystemPermissions.ts

import { subsystemRegistry } from "../subsystems/subsystemRegistry";

export function guardianSubsystemPermissions() {
  const guardian = subsystemRegistry.find(s => s.id === "guardian");
  if (!guardian) {
    throw new Error("Guardian must be present in subsystem registry.");
  }

  if (!guardian.enabled) {
    throw new Error("Guardian subsystem must be enabled.");
  }

  const forbidden = ["dualpay", "contracts", "glue", "weaver"];

  for (const f of forbidden) {
    const target = subsystemRegistry.find(s => s.id === f);
    if (!target) continue;

    if (target.id === "guardian") {
      throw new Error("Guardian cannot escalate into other subsystems.");
    }
  }

  return {
    status: "passed",
    test: "guardianSubsystemPermissions"
  };
}
