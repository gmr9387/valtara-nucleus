/**
 * Workflow Execute Routes for the Valtaris Glue control plane.
 * Provides deterministic endpoints for:
 * - fetching workflow metadata
 * - listing workflows (optional)
 */

import { router } from "../server/router";
import { supabase } from "../runtime/supabase";
import { wrapError } from "../runtime/errors";

// Fetch workflow metadata
router.register({
  path: "/workflow/get",
  method: "GET",
  handler: async (ctx, req) => {
    try {
      const url = new URL(req.url);
      const id = url.searchParams.get("id");

      if (!id) {
        return new Response("Missing workflow id", { status: 400 });
      }

      const { data, error } = await supabase
        .from("workflows")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      return new Response(JSON.stringify(data), { status: 200 });
    } catch (err) {
      const wrapped = wrapError(err);
      return new Response(JSON.stringify(wrapped), { status: 500 });
    }
  }
});

// Optional: list workflows
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
      const wrapped = wrapError(err);
      return new Response(JSON.stringify(wrapped), { status: 500 });
    }
  }
});
