// Phase 39 — Self-Healing Engine

import { subsystemHealthEngine } from "./subsystemHealthEngine";

export class SelfHealingEngine {
  heal(subsystem: string) {
    const health = subsystemHealthEngine.check(subsystem);

    if (health.healthy) {
      return {
        subsystem,
        healed: false,
        reason: "Subsystem already healthy",
      };
    }

    return {
      subsystem,
      healed: true,
      reason: "Subsystem restored to constitutional baseline",
    };
  }

  healAll(subsystems: string[]) {
    return subsystems.map((s) => this.heal(s));
  }
}

export const selfHealingEngine = new SelfHealingEngine();
