/**
 * Workflow Routes for the Valtaris Glue control plane.
 * Final integration layer wiring all workflow endpoints:
 * - metadata
 * - listing
 * - execution
 * - instance retrieval
 * - step-state retrieval
 */

import { router } from "../server/router";
import { supabase } from "../runtime/supabase";
import { wrapError } from "../runtime/errors";
import { WorkflowRuntimeController } from "./workflowRuntimeController";

const runtime = new WorkflowRuntimeController();

/* -------------------------------------------------------
 * WORKFLOW METADATA
 * ----------------------------------------------------- */

// GET /workflow/get
router.register({
  path: "/workflow/get",
  method: "GET",
  handler: async (ctx, req) => {
    try {
      const url = new URL(req.url);
      const id = url.searchParams.get("id");
      if (!id) return new Response("Missing workflow id", { status: 400 });

      const { data, error } = await supabase
        .from("workflows")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return new Response(JSON.stringify(data), { status: 200 });
    } catch (err) {
      return new Response(JSON.stringify(wrapError(err)), { status: 500 });
    }
  }
});

// GET /workflow/list
router.register({
  path: "/workflow/list",
  method: "GET",
  handler: async () => {
    try {
      const { data, error } = await supabase
        .from("workflows")
        .select("*")
        .order("createdAt", { ascending: false });

      if (error) throw error;
      return new Response(JSON.stringify(data), { status: 200 });
    } catch (err) {
      return new Response(JSON.stringify(wrapError(err)), { status: 500 });
    }
  }
});

/* -------------------------------------------------------
 * WORKFLOW EXECUTION
 * ----------------------------------------------------- */

// POST /workflow/execute
router.register({
  path: "/workflow/execute",
  method: "POST",
  handler: async (ctx, req) => {
    return runtime.execute(ctx, req);
  }
});

/* -------------------------------------------------------
 * WORKFLOW INSTANCE
 * ----------------------------------------------------- */

// GET /workflow/instance/get
router.register({
  path: "/workflow/instance/get",
  method: "GET",
  handler: async (ctx, req) => {
    return runtime.getInstance(ctx, req);
  }
});

// GET /workflow/instance/steps
router.register({
  path: "/workflow/instance/steps",
  method: "GET",
  handler: async (ctx, req) => {
    try {
      const url = new URL(req.url);
      const instanceId = url.searchParams.get("instanceId");
      if (!instanceId) {
        return new Response("Missing instanceId", { status: 400 });
      }

      const { data, error } = await supabase
        .from("workflow_step_states")
        .select("*")
        .eq("instanceId", instanceId)
        .order("startedAt", { ascending: true });

      if (error) throw error;
      return new Response(JSON.stringify(data), { status: 200 });
    } catch (err) {
      return new Response(JSON.stringify(wrapError(err)), { status: 500 });
    }
  }
});
