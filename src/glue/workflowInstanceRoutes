/**
 * Workflow instance routes for the Valtaris Glue control plane.
 * Exposes deterministic endpoints for:
 * - fetching step states for an instance
 */

import { router } from "../server/router";
import { supabase } from "../runtime/supabase";
import { wrapError } from "../runtime/errors";

// Fetch step states for a workflow instance
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
      const wrapped = wrapError(err);
      return new Response(JSON.stringify(wrapped), { status: 500 });
    }
  }
});
