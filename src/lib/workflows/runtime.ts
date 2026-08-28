// Phase 14.2 — Wire workflow engine → Nucleus

import { NucleusWorkflowAdapter } from "../../nucleus/workflows/nucleusWorkflowAdapter";

export async function startWorkflow(workflow, supabase, organizationId) {
  const adapter = new NucleusWorkflowAdapter(
    organizationId,
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_KEY!
  );

  for (const step of workflow.steps) {
    await adapter.handleWorkflowEvent({
      type: step.type,
      version: step.version,
      payload: {
        ...step.payload,
        organizationId,
      },
    });
  }

  return { ok: true };
}
