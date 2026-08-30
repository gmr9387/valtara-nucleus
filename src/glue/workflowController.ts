/**
 * Workflow controller for the Valtaris control plane.
 * Provides deterministic request parsing, RLS enforcement,
 * and delegation to workflow services and runtime.
 */

import { WorkflowService } from "./workflowService";
import { WorkflowRuntime } from "./workflowRuntime";
import { RLSContext } from "../runtime/rls";
import { wrapError } from "../runtime/errors";

export class WorkflowController {
  private service: WorkflowService;
  private runtime: WorkflowRuntime;

  constructor() {
    this.service = new WorkflowService();
    this.runtime = new WorkflowRuntime();
  }

  private parseRLS(req: Request): RLSContext {
    const url = new URL(req.url);

    return {
      organizationId: url.searchParams.get("organizationId") ?? "",
      projectId: url.searchParams.get("projectId") ?? "",
      environmentId: url.searchParams.get("environmentId") ?? "",
      userId: url.searchParams.get("userId") ?? "",
      metadata: {}
    };
  }

  async list(ctx: any, req: Request): Promise<Response> {
    try {
      const workflows = await this.service.list(ctx);
      return new Response(JSON.stringify(workflows), { status: 200 });
    } catch (err) {
      const wrapped = wrapError(err);
      return new Response(JSON.stringify(wrapped), { status: 500 });
    }
  }

  async create(ctx: any, req: Request): Promise<Response> {
    try {
      const body = await req.json();
      const workflow = await this.service.create(ctx, body);
      return new Response(JSON.stringify(workflow), { status: 201 });
    } catch (err) {
      const wrapped = wrapError(err);
      return new Response(JSON.stringify(wrapped), { status: 500 });
    }
  }

  async get(ctx: any, req: Request): Promise<Response> {
    try {
      const url = new URL(req.url);
      const id = url.searchParams.get("id");

      if (!id) {
        return new Response("Missing workflow ID", { status: 400 });
      }

      const workflow = await this.service.get(ctx, id);
      return new Response(JSON.stringify(workflow), { status: 200 });
    } catch (err) {
      const wrapped = wrapError(err);
      return new Response(JSON.stringify(wrapped), { status: 500 });
    }
  }

  async execute(ctx: any, req: Request): Promise<Response> {
    try {
      const body = await req.json();
      const rls = this.parseRLS(req);

      const { workflow, definition } = await this.service.loadForExecution(ctx, body.workflowId);

      const instance = await this.runtime.execute(workflow, definition, rls);

      return new Response(JSON.stringify(instance), { status: 200 });
    } catch (err) {
      const wrapped = wrapError(err);
      return new Response(JSON.stringify(wrapped), { status: 500 });
    }
  }
}
