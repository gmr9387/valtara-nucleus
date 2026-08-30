// src/nucleus/decision/engine.ts
// Full file — Unified decision engine using your repo's filenames

import { Executor } from "./executor";
import { Governance } from "./governance";
import { Confidence } from "./confidence";
import { Replay } from "./replay";

export class DecisionEngine {
  private executor = new Executor();
  private governance = new Governance();
  private confidence = new Confidence();
  private replay = new Replay();

  constructor(private organizationId: string, private subsystem: string) {}

  addRule(rule: {
    id: string;
    name: string;
    condition: (ctx: any) => boolean;
    effect: "allow" | "deny";
  }) {
    this.governance.addRule(rule);
  }

  evaluate(context: any) {
    const governanceDecision = this.governance.evaluate(context);

    const base = this.executor.execute({
      organizationId: this.organizationId,
      subsystem: this.subsystem,
      context,
    });

    const finalAllowed = governanceDecision === "allow" && base.allowed;

    const finalConfidence = this.confidence.score([base.confidence]);

    this.replay.record(this.subsystem, "decision", {
      context,
      governanceDecision,
      finalAllowed,
      finalConfidence,
    });

    return {
      allowed: finalAllowed,
      confidence: finalConfidence,
      reasons: base.reasons,
    };
  }

  getReplay() {
    return this.replay.replay();
  }
}
