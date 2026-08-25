/**
 * Workflow runtime routes for the Valtaris Glue control plane.
 * Exposes deterministic runtime endpoints:
 * - execute workflow
 * - fetch workflow instance
 */

import { router } from "../server/router";
import { WorkflowRuntimeController } from "./workflowRuntimeController";

const controller = new WorkflowRuntimeController();

// Execute workflow
router.register({
  path: "/workflow/execute",
  method: "POST",
  handler: async (ctx, req) => {
    return controller.execute(ctx, req);
  }
});

// Fetch workflow instance
router.register({
  path: "/workflow/instance/get",
  method: "GET",
  handler: async (ctx, req) => {
    return controller.getInstance(ctx, req);
  }
});
