// src/nucleus/http/workflowController.ts
// Full file — Workflow HTTP controller

import { startWorkflow } from "../../lib/workflows/runtime";

export class WorkflowController {
  static async run(req: any, res: any) {
    try {
      const workflow = req.body.workflow;
      const org = req.identity.getOrganizationId();

      const result = await startWorkflow(workflow, org);

      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}
