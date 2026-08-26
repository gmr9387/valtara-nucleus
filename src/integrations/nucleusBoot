/**
 * nucleusBoot.ts
 *
 * Swap 44: Nucleus Boot Sequence
 *
 * Boots the entire Nucleus control plane.
 */

import { startRealtimeEventStream } from "./realtimeEventStream";
import { startRealtimeWorkflowStream } from "./realtimeWorkflowStream";
import { startRealtimeDecisionStream } from "./realtimeDecisionStream";

import { registerOrchestrationTrigger } from "./eventOrchestration";
import { registerGlobalRule } from "./nucleusGovernance";

export async function bootNucleus() {
  console.log("[Nucleus] Booting control plane...");

  // Start real-time streams
  startRealtimeEventStream();
  startRealtimeWorkflowStream();
  startRealtimeDecisionStream();

  console.log("[Nucleus] Real-time streams online");

  // Load orchestration triggers
  registerOrchestrationTrigger({
    subsystem: "workflow",
    eventType: "user.created",
    workflowId: "onUserCreated"
  });

  registerOrchestrationTrigger({
    subsystem: "decision",
    eventType: "payment.initiated",
    modelId: "paymentRiskModel"
  });

  console.log("[Nucleus] Orchestration triggers loaded");

  // Load global governance rules
  registerGlobalRule({
    id: "global.payment.limit",
    description: "Payments over $10,000 require governance approval",
    appliesTo: ["ledger"],
    evaluate: async (payload) => {
      return payload.amount <= 10000;
    }
  });

  console.log("[Nucleus] Global governance rules loaded");

  console.log("[Nucleus] Control plane boot complete");
}
