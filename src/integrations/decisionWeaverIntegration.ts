/**
 * decisionWeaverIntegration.ts
 *
 * Full file replacement — Swap 36
 *
 * This version includes:
 * - Durable decision evaluation sync to Supabase
 * - Event-driven lifecycle logging
 * - Identity propagation
 * - Error propagation + durable error logging
 * - Architectural alignment with Decision Weaver 9.x runtime
 */

import { logEvent } from "./supabase/rpc/logEvent";
import { logTelemetry } from "./supabase/rpc/logTelemetry";
import { logError } from "./supabase/rpc/logError";
import { NucleusIdentity } from "./identityBinding";

export interface DecisionEvaluationOptions {
  modelId: string;
  input: any;
  identity: NucleusIdentity;
}

export interface DecisionEvaluationResult {
  modelId: string;
  evaluationId: string;
  output: any;
}

export const decisionWeaverIntegration = {
  /**
   * Evaluate a decision model
   */
  async evaluateModel(
    modelId: string,
    input: any,
    identity: NucleusIdentity
  ): Promise<DecisionEvaluationResult> {
    const evaluationId = crypto.randomUUID();

    // Simulated model evaluation (replace with your actual model logic)
    const output = {
      decision: "approved",
      confidence: 0.92,
      input
    };

    // Durable event sync
    const event = {
      id: crypto.randomUUID(),
      source: "decision-weaver",
      type: "decision.evaluated",
      context: {
        tenantId: identity.tenantId,
        projectId: identity.projectId,
        actor: identity.actor
      },
      payload: {
        modelId,
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
        subsystem: "decision-weaver",
        level: "info",
        message: `Decision model '${modelId}' evaluated`,
        metadata: event.context,
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      // Durable error logging
      await logError({
        id: crypto.randomUUID(),
        subsystem: "decision-weaver",
        code: "DECISION_SYNC_FAILED",
        message: err.message,
        context: event.context,
        timestamp: new Date().toISOString()
      });

      throw err;
    }

    return {
      modelId,
      evaluationId,
      output
    };
  }
};
