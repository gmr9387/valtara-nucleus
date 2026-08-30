/**
 * guardianIntegration.ts
 *
 * Full file replacement — Swap 37
 *
 * This version includes:
 * - Durable governance rule evaluation sync to Supabase
 * - Event-driven lifecycle logging
 * - Identity propagation
 * - Error propagation + durable error logging
 * - Architectural alignment with Guardian 9.x runtime
 */

import { logEvent } from "./supabase/rpc/logEvent";
import { logTelemetry } from "./supabase/rpc/logTelemetry";
import { logError } from "./supabase/rpc/logError";
import { NucleusIdentity } from "./identityBinding";

export interface GovernanceEvaluationOptions {
  ruleId: string;
  input: any;
  identity: NucleusIdentity;
}

export interface GovernanceEvaluationResult {
  ruleId: string;
  evaluationId: string;
  output: any;
}

export const guardianIntegration = {
  /**
   * Evaluate a governance rule
   */
  async evaluateRule(
    ruleId: string,
    input: any,
    identity: NucleusIdentity
  ): Promise<GovernanceEvaluationResult> {
    const evaluationId = crypto.randomUUID();

    // Simulated rule evaluation (replace with your actual rule logic)
    const output = {
      allowed: true,
      reason: "Rule passed",
      input
    };

    // Durable event sync
    const event = {
      id: crypto.randomUUID(),
      source: "guardian",
      type: "governance.evaluated",
      context: {
        tenantId: identity.tenantId,
        projectId: identity.projectId,
        actor: identity.actor
      },
      payload: {
        ruleId,
        evaluationId,
        input,
        output
      },
      timestamp: new Date().toISOString()
    };

    try {
      // Persist event
      await logEvent(event);

      // Telemetry
      await logTelemetry({
        id: crypto.randomUUID(),
        subsystem: "guardian",
        level: "info",
        message: `Governance rule '${ruleId}' evaluated`,
        metadata: event.context,
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      // Durable error logging
      await logError({
        id: crypto.randomUUID(),
        subsystem: "guardian",
        code: "GOVERNANCE_SYNC_FAILED",
        message: err.message,
        context: event.context,
        timestamp: new Date().toISOString()
      });

      throw err;
    }

    return {
      ruleId,
      evaluationId,
      output
    };
  }
};
