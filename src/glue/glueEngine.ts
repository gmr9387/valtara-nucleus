// src/glue/glueEngine.ts

/**
 * Glue Adaptive Engine (Phase 20)
 *
 * Reacts to:
 *   - Weaver opportunity score
 *   - Guardian authorization decision
 *   - Claim metadata
 */

export type GlueInput = {
  claimId: string;
  organizationId: string;

  opportunityScore?: number;

  authorization?: {
    decision: "allow" | "deny";
  };

  metadata?: Record<string, any>;
};

export type GlueOutput = {
  status: "executed" | "skipped" | "escalated";
  reason: string;
};

export class GlueEngine {
  static decide(input: GlueInput): GlueOutput {
    const { opportunityScore, authorization, metadata } = input;

    // Guardian denies → skip
    if (authorization?.decision === "deny") {
      return {
        status: "skipped",
        reason: "Authorization denied by Guardian"
      };
    }

    // High-risk metadata → escalate
    if (metadata?.risk === "high") {
      return {
        status: "escalated",
        reason: "High-risk metadata detected"
      };
    }

    // Strong opportunity → execute
    if ((opportunityScore ?? 0) >= 70) {
      return {
        status: "executed",
        reason: "Strong opportunity score"
      };
    }

    // Weak opportunity → skip
    if ((opportunityScore ?? 0) <= 30) {
      return {
        status: "skipped",
        reason: "Weak opportunity score"
      };
    }

    // Default → escalate
    return {
      status: "escalated",
      reason: "Insufficient data for confident execution"
    };
  }
}
