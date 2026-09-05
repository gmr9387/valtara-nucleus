// Phase 32 — Full Multi-Agent Orchestration Suite Runner

import { runOpportunityToPaymentWorkflow } from "./workflowOpportunityToPayment";
import { runCrossResourceMutationWorkflow } from "./workflowCrossResourceMutation";

export async function runOrchestrationSuite() {
  console.log("🔵 Phase 32 — Multi-Agent Orchestration Suite Starting...");

  const workflow1 = await runOpportunityToPaymentWorkflow();
  const workflow2 = await runCrossResourceMutationWorkflow();

  console.log("🟢 Workflow 1 (Opportunity → Payment):", workflow1);
  console.log("🟢 Workflow 2 (Cross-Resource Mutation):", workflow2);

  console.log("🔵 Phase 32 — Multi-Agent Orchestration Suite Complete.");
}
