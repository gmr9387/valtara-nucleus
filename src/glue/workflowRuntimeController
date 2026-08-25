/**
 * WorkflowRuntimeController for the Valtaris Glue control plane.
 * Exposes deterministic runtime endpoints:
 * - execute workflow
 * - fetch workflow instance
 */

import { WorkflowRuntime } from "./workflowRuntime";
import { wrapError } from "../runtime/errors";

export class WorkflowRuntimeController {
  private runtime: WorkflowRuntime;

  constructor() {
    this.runtime = new WorkflowRuntime();
  }

  /**
   * Execute a workflow by ID.
   */
  async execute(ctx: any, req: Request): Promise<Response> {
    try {
      const body = await req.json();
      const workflowId = body.workflowId;
      const userId = body.userId ?? ctx.userId ?? "system";

      if (!workflowId) {
        return new Response("Missing workflowId", { status: 400 });
      }

      const instance = await this.runtime.execute(ctx, workflowId, userId);
      return new Response(JSON.stringify(instance), { status: 200 });
    } catch (err) {
      const wrapped = wrapError(err);
      return new Response(JSON.stringify(wrapped), { status: 500 });
    }
  }

  /**
   * Fetch a workflow instance by ID.
   */
  async getInstance(ctx: any, req: Request): Promise<Response> {
    try {
      const url = new URL(req.url);
      const instanceId = url.searchParams.get("instanceId");

      if (!instanceId) {
        return new Response("Missing instanceId", { status: 400 });
      }

      const instance = await this.runtime.getInstance(instanceId);
      return new Response(JSON.stringify(instance), { status: 200 });
    } catch (err) {
      const wrapped = wrapError(err);
      return new Response(JSON.stringify(wrapped), { status: 500 });
    }
  }
}
