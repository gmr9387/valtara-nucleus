// src/lib/workflows/runtime.ts
// Full file swap — Phase 14 unified workflow → Nucleus execution path

import { NucleusWorkflowAdapter } from "../../nucleus/workflows/nucleusWorkflowAdapter";

export async function startWorkflow(workflow: any, organizationId: string) {
  const adapter = new NucleusWorkflowAdapter(
    organizationId,
    process.env.VITE_NUCLEUS_SUPABASE_URL!,
    process.env.VITE_NUCLEUS_SUPABASE_ANON_KEY!
  );

  const results: any[] = [];

  for (const step of workflow.steps) {
    const event = {
      type: step.type,
      version: step.version,
      payload: {
        ...step.payload,
        organizationId,
      },
    };

    const lineage = await adapter.handleWorkflowEvent(event);
    results.push(lineage);
  }

  return {
    ok: true,
    workflowId: workflow.id,
    steps: workflow.steps.length,
    lineage: results,
  };
}
