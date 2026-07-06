/**
 * ValtariOS Glue — Stable Execute API Handler
 *
 * Pure HTTP handler for POST /api/v0/workflows/execute.
 * Called by Core after a requires_approval decision to trigger a workflow run.
 *
 * Accepts a GlueExecuteRequest, validates X-Glue-Api-Key, resolves the pinned
 * workflow version, creates a workflow run (and first pending step when the
 * workflow definition includes steps), and returns the run envelope.
 *
 * Separated from the route file so the handler can be unit-tested
 * without a running HTTP server and without TanStack Start machinery.
 *
 * Core integration:
 *   POST /api/v0/workflows/execute
 *   Content-Type: application/json
 *   X-Glue-Api-Key: <GLUE_API_KEY>
 *   Body: { organizationId, workflowKey, workflowVersionId?, workflowVersion?,
 *           subjectId, correlationId, payload }
 */

import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { validateGlueApiKey, GLUE_API_KEY_HEADER } from "@/lib/glue/m2m-auth";

// ── Input schema ──────────────────────────────────────────────────────────────

export const executeRequestSchema = z
  .object({
    organizationId: z.string().min(1),
    workflowKey: z.string().min(1),
    workflowVersionId: z.string().uuid().optional(),
    workflowVersion: z.number().int().positive().optional(),
    subjectId: z.string().min(1),
    correlationId: z.string().min(1),
    payload: z.record(z.unknown()),
  })
  .refine((d) => d.workflowVersionId !== undefined || d.workflowVersion !== undefined, {
    message: "At least one of workflowVersionId or workflowVersion must be provided.",
    path: ["workflowVersionId"],
  });

export type GlueExecuteRequest = z.infer<typeof executeRequestSchema>;

// ── Response type ─────────────────────────────────────────────────────────────

export interface GlueExecuteResponse {
  runId: string;
  workflowVersionId: string;
  status: string;
  correlationId: string;
}

// ── IO interface (injectable for tests) ──────────────────────────────────────

export interface GlueExecutionIO {
  /**
   * Look up a workflow by key (name) scoped to an organization.
   * Returns null if not found or archived.
   */
  resolveWorkflow(
    organizationId: string,
    workflowKey: string,
  ): Promise<{ id: string; status: string } | null>;

  /**
   * Resolve a specific version of a workflow.
   * If versionId is provided it takes precedence over versionNumber.
   * Returns null if the version is not found or not published.
   */
  resolveVersion(
    workflowId: string,
    opts: { versionId?: string; versionNumber?: number },
  ): Promise<{
    id: string;
    version_number: number;
    status: string;
    firstStepKey: string | null;
  } | null>;

  /**
   * Check if a run already exists for this (organizationId, correlationId) pair.
   * Supports idempotency: a duplicate call with the same correlationId returns
   * the existing run rather than creating a second one.
   */
  findRunByCorrelationId(
    organizationId: string,
    correlationId: string,
  ): Promise<{ id: string; version_id: string; status: string } | null>;

  /**
   * Persist a new workflow run in "pending" state.
   */
  createRun(args: {
    organizationId: string;
    workflowId: string;
    versionId: string;
    subjectId: string;
    correlationId: string;
    payload: unknown;
  }): Promise<{ id: string; version_id: string; status: string }>;

  /**
   * Create the first pending step for a newly created run.
   * Called only when the workflow definition includes at least one step.
   */
  createFirstStep(args: { runId: string; stepKey: string }): Promise<void>;
}

// ── Supabase admin client (service-role, bypasses RLS) ───────────────────────

function makeAdminClient() {
  const url =
    (import.meta.env?.VITE_SUPABASE_URL as string | undefined) ?? process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing Supabase service-role config (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).",
    );
  }

  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// ── IO implementation ─────────────────────────────────────────────────────────

function buildIO(adminClient: ReturnType<typeof makeAdminClient>): GlueExecutionIO {
  return {
    async resolveWorkflow(organizationId, workflowKey) {
      const { data, error } = await adminClient
        .from("workflows")
        .select("id, status")
        .eq("organization_id", organizationId)
        .eq("name", workflowKey)
        .neq("status", "archived")
        .maybeSingle();
      if (error) throw error;
      return data as { id: string; status: string } | null;
    },

    async resolveVersion(workflowId, { versionId, versionNumber }) {
      let query = adminClient
        .from("workflow_versions")
        .select("id, version_number, status, definition_json")
        .eq("workflow_id", workflowId)
        .eq("status", "published");

      if (versionId) {
        query = query.eq("id", versionId);
      } else if (versionNumber !== undefined) {
        query = query.eq("version_number", versionNumber);
      } else {
        query = query.order("version_number", { ascending: false }).limit(1);
      }

      const { data, error } = await query.maybeSingle();
      if (error) throw error;
      if (!data) return null;

      // Extract the first step key from the definition (if any)
      const def = data.definition_json as {
        steps?: Array<{ key: string }>;
      } | null;
      const firstStepKey = def?.steps?.[0]?.key ?? null;

      return {
        id: data.id as string,
        version_number: data.version_number as number,
        status: data.status as string,
        firstStepKey,
      };
    },

    async findRunByCorrelationId(organizationId, correlationId) {
      const { data, error } = await adminClient
        .from("workflow_runs")
        .select("id, version_id, status")
        .eq("organization_id", organizationId)
        .eq("correlation_id", correlationId)
        .maybeSingle();
      if (error) throw error;
      return data as { id: string; version_id: string; status: string } | null;
    },

    async createRun({ organizationId, workflowId, versionId, subjectId, correlationId, payload }) {
      const { data, error } = await adminClient
        .from("workflow_runs")
        .insert({
          organization_id: organizationId,
          workflow_id: workflowId,
          version_id: versionId,
          status: "pending",
          subject_id: subjectId,
          correlation_id: correlationId,
          payload: payload as never,
        })
        .select("id, version_id, status")
        .single();

      if (error || !data) throw error ?? new Error("Failed to create workflow run");
      return data as { id: string; version_id: string; status: string };
    },

    async createFirstStep({ runId, stepKey }) {
      const { error } = await adminClient.from("workflow_steps").insert({
        run_id: runId,
        step_key: stepKey,
        status: "pending",
      });
      if (error) throw error;
    },
  };
}

// ── Handler ───────────────────────────────────────────────────────────────────

/**
 * Handle a POST /api/v0/workflows/execute request.
 *
 * @param request    - The incoming HTTP Request object.
 * @param ioOverride - Optional IO override for tests (bypasses Supabase).
 */
export async function handleExecuteRequest(
  request: Request,
  ioOverride?: GlueExecutionIO,
): Promise<Response> {
  // ── 1. Auth: require X-Glue-Api-Key before any IO ─────────────────────────
  const providedKey = request.headers.get(GLUE_API_KEY_HEADER);
  const envKey = process.env.GLUE_API_KEY;

  if (!validateGlueApiKey(providedKey, envKey)) {
    return Response.json(
      {
        error: "Unauthorized",
        message: "Invalid or missing X-Glue-Api-Key header.",
      },
      { status: 401 },
    );
  }

  // ── 2. Parse body ──────────────────────────────────────────────────────────
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return Response.json(
      { error: "Bad Request", message: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  // ── 3. Validate schema ─────────────────────────────────────────────────────
  const parsed = executeRequestSchema.safeParse(raw);
  if (!parsed.success) {
    return Response.json(
      {
        error: "Bad Request",
        message: "Invalid request payload.",
        issues: parsed.error.issues,
      },
      { status: 400 },
    );
  }

  const {
    organizationId,
    workflowKey,
    workflowVersionId,
    workflowVersion,
    subjectId,
    correlationId,
    payload,
  } = parsed.data;

  const io = ioOverride ?? buildIO(makeAdminClient());

  // ── 4. Idempotency: return existing run for duplicate correlationId ────────
  const existing = await io.findRunByCorrelationId(organizationId, correlationId);
  if (existing) {
    return Response.json(
      {
        runId: existing.id,
        workflowVersionId: existing.version_id,
        status: existing.status,
        correlationId,
      } satisfies GlueExecuteResponse,
      { status: 200 },
    );
  }

  // ── 5. Resolve workflow (scoped to organization) ───────────────────────────
  const workflow = await io.resolveWorkflow(organizationId, workflowKey);
  if (!workflow) {
    return Response.json(
      {
        error: "Not Found",
        message: `Workflow '${workflowKey}' not found or archived for this organization.`,
      },
      { status: 404 },
    );
  }

  // ── 6. Resolve pinned version ──────────────────────────────────────────────
  const version = await io.resolveVersion(workflow.id, {
    versionId: workflowVersionId,
    versionNumber: workflowVersion,
  });
  if (!version) {
    return Response.json(
      {
        error: "Not Found",
        message: "Workflow version not found or not published.",
      },
      { status: 404 },
    );
  }

  // ── 7. Create workflow run ─────────────────────────────────────────────────
  const run = await io.createRun({
    organizationId,
    workflowId: workflow.id,
    versionId: version.id,
    subjectId,
    correlationId,
    payload,
  });

  // ── 8. Create first pending step if the definition declares steps ──────────
  if (version.firstStepKey) {
    await io.createFirstStep({ runId: run.id, stepKey: version.firstStepKey });
  }

  // ── 9. Return run envelope ─────────────────────────────────────────────────
  return Response.json(
    {
      runId: run.id,
      workflowVersionId: run.version_id,
      status: run.status,
      correlationId,
    } satisfies GlueExecuteResponse,
    { status: 201 },
  );
}
