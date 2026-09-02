export type DualPayInput = {
  claimId: string;
  organizationId: string;

  execution?: {
    status: "executed" | "skipped" | "escalated";
    reason: string;
  };

  opportunity?: {
    score?: number;
  };

  authorization?: {
    decision: "allow" | "deny";
  };

  recommendation?: {
    action: "approve" | "deny" | "review" | "escalate";
    confidence: number;
  };
};

export type DualPayOutput = {
  financialAction: "charge" | "hold" | "release" | "deny";
  amount: number;
  reason: string;
};

export class DualPayEngine {
  static react(input: DualPayInput): DualPayOutput {
    const { execution, opportunity, authorization, recommendation } = input;

    if (authorization?.decision === "deny") {
      return {
        financialAction: "deny",
        amount: 0,
        reason: "Authorization denied by Guardian"
      };
    }

    if (execution?.status === "escalated") {
      return {
        financialAction: "hold",
        amount: 0,
        reason: "Glue escalated workflow"
      };
    }

    if (execution?.status === "skipped") {
      return {
        financialAction: "release",
        amount: 0,
        reason: "Workflow skipped"
      };
    }

    if (execution?.status === "executed") {
      const baseAmount = 25;
      const score = opportunity?.score ?? 50;
      const confidence = recommendation?.confidence ?? 0.5;

      const multiplier = (score / 100) * (0.5 + confidence / 2);

      return {
        financialAction: "charge",
        amount: Math.round(baseAmount * multiplier),
        reason: "Workflow executed successfully"
      };
    }

    return {
      financialAction: "hold",
      amount: 0,
      reason: "Insufficient data for financial decision"
    };
  }
}
